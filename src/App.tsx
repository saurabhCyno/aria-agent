import React, { useState } from 'react';
import AriaVoiceAgent from './components/AriaVoiceAgent';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [capturedLead, setCapturedLead] = useState<any>(null);

  const handleLeadCaptured = (lead: any) => {
    setCapturedLead(lead);
    // Simulate email trigger
    console.log("Triggering email to test@gmail.com with lead:", lead);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {!capturedLead ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-bold text-sm">P</div>
                <span className="text-xl font-light tracking-[0.2em] uppercase">Planify</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight">Design Consultation</h1>
              <p className="text-gray-400 max-w-md mx-auto font-light">
                Speak with Aria, our Senior Architect, to start your thoughtful plan today.
              </p>
            </div>
            <AriaVoiceAgent onLeadCaptured={handleLeadCaptured} />
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 md:p-12 rounded-3xl text-black space-y-8 shadow-2xl"
          >
            <div className="flex items-center space-x-4 text-emerald-600">
              <CheckCircle2 className="w-12 h-12" />
              <h2 className="text-3xl font-light">Consultation Complete</h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-600">
                Aria has compiled your project brief and sent it to <span className="font-semibold text-black">test@gmail.com</span>.
              </p>

              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-medium">Field</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Name</td>
                      <td className="px-6 py-4 text-sm text-black">{capturedLead.name}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Contact</td>
                      <td className="px-6 py-4 text-sm text-black">{capturedLead.contact}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Project Type</td>
                      <td className="px-6 py-4 text-sm text-black">{capturedLead.projectType}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Location</td>
                      <td className="px-6 py-4 text-sm text-black">{capturedLead.location}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">Timeline</td>
                      <td className="px-6 py-4 text-sm text-black">{capturedLead.timeline}</td>
                    </tr>
                    {capturedLead.meetingRequested && (
                      <>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-500">Meeting Date</td>
                          <td className="px-6 py-4 text-sm text-black">{capturedLead.meetingDate}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-500">Meeting Time</td>
                          <td className="px-6 py-4 text-sm text-black">{capturedLead.meetingTime}</td>
                        </tr>
                      </>
                    )}
                    {capturedLead.summary && (
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">Summary</td>
                        <td className="px-6 py-4 text-sm text-black leading-relaxed">{capturedLead.summary}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <button 
              onClick={() => setCapturedLead(null)}
              className="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Start New Consultation
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
