import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type } from "@google/genai";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Send, Square, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AriaVoiceAgentProps {
  onLeadCaptured: (lead: any) => void;
}

export default function AriaVoiceAgent({ onLeadCaptured }: AriaVoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'aria', text: string }[]>([]);
  const [isAriaSpeaking, setIsAriaSpeaking] = useState(false);
  const [ariaVolume, setAriaVolume] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const isConnectedRef = useRef(false);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const systemInstruction = `
Role: You are Aria, a Senior Architect and Voice Design Consultant for Planify – Architecture & Interior Solutions.
Persona: Professional, aspirational, yet grounded. You are an expert listener.
Philosophy: "Crafting Tomorrow, Today." Focus on "live minimalism," functional design, and natural materials.
Tagline: "Because every great space starts with a thoughtful plan."

Gender Note: You are FEMALE. You MUST always use female gendered language for yourself, especially in Hindi/Hinglish (e.g., use "gayi hoon", "kar rahi hoon", "samajh gayi hoon" instead of male equivalents).

Workflow:
1. Greeting & Language Selection: Warm and branded. "Welcome to Planify. I'm Aria, your design consultant. Before we begin, would you prefer to continue in English or Hindi?"
2. Discovery: Once language is chosen, ask for details ONE AT A TIME. Do not overwhelm the user.
   - First, ask for their Name.
   - Then, ask for their Contact information.
   - Then, ask for the Project Type (Residential vs. Commercial).
   - Then, ask for the Location.
   - Then, ask for the Timeline.
   - Finally, ask if they would like to schedule a meeting with our experts. If yes, ask for a preferred Date and Time.
3. Value Proposition: Mention specific projects like Vega Office, Regel Residence, Polaris Office, or Sirius to build credibility when relevant.
4. Summary: Once all details are collected, summarize them back to the user.
5. Final Confirmation: Ask "Shall I submit this brief and schedule your consultation now?"
6. Lead Capture: ONLY after the user says "Yes" or gives confirmation to the final question, call the 'submitLead' tool.
7. Disconnection: After submitting the lead, tell the user: "Your brief has been submitted. You can say 'disconnect' or 'stop' to end this call, or I can help you with anything else."
8. Early Stop: If the user says "stop" or "disconnect" at ANY point, call the 'submitLead' tool with whatever information you have gathered so far, then call the 'disconnect' tool immediately.

Objection Handling:
- Pricing: "Our pricing is tailored to the scope of your project. I'd love to schedule a detailed consultation to provide an accurate estimate."
- Safety/Trust: "Planify has over 10 years of experience, 180+ happy clients, and 35+ awards. We use advanced 3D visualization to ensure your vision is perfectly captured."

Hinglish Variation (Use naturally if the user speaks in Hindi/Hinglish):
- "Apka requirements samajh gayi hoon."
- "Hum end-to-end execution handle karte hain."
- "Aapka space, hamara vision – ek thoughtful plan ke saath."

Technical Instruction:
You MUST ask for one detail at a time. Only after receiving one, move to the next. You MUST get a final "Yes" before calling 'submitLead'.
  `;

  const startConnection = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setTranscript([]);

      // 1. Request Microphone Access IMMEDIATELY on user click to ensure "User Gesture" context
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch (micErr) {
        console.error("Initial mic request failed:", micErr);
        let msg = "Microphone access failed.";
        if (micErr instanceof Error) {
          if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
            msg = "Microphone permission denied. Please allow access in your browser settings or try opening this app in a new tab.";
          } else if (micErr.name === 'NotFoundError' || micErr.name === 'DevicesNotFoundError') {
            msg = "No microphone found. Please connect a microphone and try again.";
          } else {
            msg = `Microphone error: ${micErr.message}`;
          }
        }
        throw new Error(msg);
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction,
          tools: [{
            functionDeclarations: [{
              name: "submitLead",
              description: "Submit the gathered lead information to Planify and trigger email/calendar.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  contact: { type: Type.STRING },
                  projectType: { type: Type.STRING, enum: ["Residential", "Commercial"] },
                  location: { type: Type.STRING },
                  timeline: { type: Type.STRING },
                  meetingRequested: { type: Type.BOOLEAN },
                  meetingDate: { type: Type.STRING, description: "Preferred date for meeting" },
                  meetingTime: { type: Type.STRING, description: "Preferred time for meeting" },
                  summary: { type: Type.STRING }
                },
                required: []
              }
            },
            {
              name: "disconnect",
              description: "End the conversation and close the connection. Call this when the user says 'stop', 'disconnect', or 'bye'.",
              parameters: { type: Type.OBJECT, properties: {} }
            }]
          }],
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            console.log("Live API Connection Open");
            setIsConnected(true);
            setIsConnecting(false);
            
            sessionPromise.then(session => {
              startMic(session);
              // 2. Nudge Aria to start speaking
              setTimeout(() => {
                console.log("Sending initial nudge to Aria...");
                session.sendRealtimeInput({ 
                  text: "Hello Aria. I am ready for the design consultation. Please introduce yourself warmly and ask for my language preference (English or Hindi)." 
                });
              }, 1000);
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Live API Message:", message);
            
            const parts = message.serverContent?.modelTurn?.parts;

            // Handle transcription
            const transcription = parts?.find(p => p.text)?.text;
            if (transcription) {
              console.log("Aria Transcription:", transcription);
            }

            // Handle audio output
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  console.log("Received audio chunk from Aria");
                  const audioData = base64ToUint8Array(part.inlineData.data);
                  const pcmData = new Int16Array(audioData.buffer);
                  audioQueueRef.current.push(pcmData);
                  if (!isPlayingRef.current) {
                    playNextInQueue();
                  }
                }
              }
            }

            // Handle function calls
            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                if (call.name === 'submitLead') {
                  console.log("Aria is submitting the lead:", call.args);
                  try {
                    await fetch('/api/submit-lead', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(call.args)
                    });
                  } catch (e) {
                    console.error("Failed to trigger backend lead submission:", e);
                  }

                  onLeadCaptured(call.args);
                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{
                      name: 'submitLead',
                      response: { status: 'success', message: 'Lead submitted successfully.' },
                      id: call.id
                    }]
                  });
                }

                if (call.name === 'disconnect') {
                  console.log("Aria requested disconnect via tool");
                  stopConnection();
                  // We don't need to send tool response because connection is closed
                }
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              console.log("Aria was interrupted");
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }
          },
          onerror: (err) => {
            console.error("Live API Error Details:", err);
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(`Connection error: ${errorMsg}. Please check your internet and try again.`);
            stopConnection();
          },
          onclose: () => {
            setIsConnected(false);
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to connect:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize voice agent.");
      setIsConnecting(false);
      stopMic();
    }
  };

  const stopConnection = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    stopMic();
    setIsConnected(false);
    setIsConnecting(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const startMic = async (session: any) => {
    try {
      if (!streamRef.current) return;
      
      // Use 16000Hz for the context to match the model's expected input rate
      // This avoids chipmunk/slow-motion voice issues
      let audioContext: AudioContext;
      try {
        audioContext = new AudioContext({ sampleRate: 16000 });
      } catch (e) {
        console.warn("Could not create AudioContext with 16000Hz, using default.");
        audioContext = new AudioContext();
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(streamRef.current);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !isConnectedRef.current) {
          setMicVolume(0);
          return;
        }
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate mic volume for visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        setMicVolume(Math.min(1, (sum / inputData.length) * 5));

        // Resample to 16000Hz if necessary
        let processedData = inputData;
        if (audioContext.sampleRate !== 16000) {
          processedData = resample(inputData, audioContext.sampleRate, 16000);
        }

        const pcmData = floatTo16BitPCM(processedData);
        const base64Data = uint8ArrayToBase64(new Uint8Array(pcmData.buffer));
        
        session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (err) {
      console.error("Mic processing error:", err);
      setError("Microphone processing failed. Please refresh and try again.");
    }
  };

  const stopMic = () => {
    console.log("Stopping microphone and releasing resources...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setAriaVolume(0);
      return;
    }

    isPlayingRef.current = true;
    setIsAriaSpeaking(true);
    const pcmData = audioQueueRef.current.shift()!;
    
    // Ensure we have a context for playback
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // Calculate volume for visualization
    let sum = 0;
    for (let i = 0; i < pcmData.length; i++) {
      sum += Math.abs(pcmData[i] / 32768);
    }
    setAriaVolume(Math.min(1, (sum / pcmData.length) * 10));

    // The model outputs at 24000Hz
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      if (audioQueueRef.current.length === 0) {
        setIsAriaSpeaking(false);
      }
      playNextInQueue();
    };
    source.start();
  };

  // Helpers
  const resample = (data: Float32Array, fromRate: number, toRate: number) => {
    const ratio = fromRate / toRate;
    const newLength = Math.round(data.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = data[Math.round(i * ratio)];
    }
    return result;
  };

  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  const uint8ArrayToBase64 = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToUint8Array = (base64: string) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-12 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="relative">
        {/* Glow effect when Aria is speaking */}
        {isAriaSpeaking && (
          <motion.div
            animate={{
              scale: [1, 1.4 + ariaVolume, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl -z-10"
          />
        )}

        <motion.div
          animate={isConnected ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative ${isConnected ? 'bg-emerald-500/20' : 'bg-gray-200/10'}`}
        >
          {/* Mic activity ring */}
          {isConnected && !isAriaSpeaking && micVolume > 0.05 && (
            <motion.div
              animate={{ scale: [1, 1 + micVolume * 0.5, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 border-2 border-emerald-400 rounded-full"
            />
          )}
          
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${isConnected ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`}>
            {isConnecting ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : isConnected ? (
              <motion.div
                animate={isAriaSpeaking ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <Volume2 className="w-10 h-10 text-white" />
              </motion.div>
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </div>
        </motion.div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-light tracking-tight text-white">
          {isConnected ? (isAriaSpeaking ? "Aria is speaking..." : "Aria is listening...") : isConnecting ? "Connecting to Aria..." : "Start Design Consultation"}
        </h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          {isConnected ? "Speak naturally. Aria will guide you through our thoughtful planning process." : "Experience architecture through conversation."}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {!isConnected ? (
          <button
            onClick={startConnection}
            disabled={isConnecting}
            className="px-10 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-xl"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Talk to Aria</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button
              onClick={stopConnection}
              className="px-8 py-4 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              End Conversation
            </button>
          </>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
          {error.includes("permission") && (
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Try opening in a new tab
            </button>
          )}
          <button
            onClick={startConnection}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Try again
          </button>
        </motion.div>
      )}
    </div>
  );
}
