import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Home, 
  MapPin, 
  Award, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  Instagram,
  Linkedin
} from 'lucide-react';
import AriaVoiceAgent from './AriaVoiceAgent';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [capturedLead, setCapturedLead] = useState<any>(null);

  const projects = [
    { title: "Vega Office", location: "Sadar", type: "Commercial", image: "https://picsum.photos/seed/vega/800/600" },
    { title: "Regel Residence", location: "Ghaziabad", type: "Residential", image: "https://picsum.photos/seed/regel/800/600" },
    { title: "Polaris Office", location: "Noida", type: "Commercial", image: "https://picsum.photos/seed/polaris/800/600" },
    { title: "Sirius", location: "Jaypee Wishtown", type: "Residential", image: "https://picsum.photos/seed/sirius/800/600" },
  ];

  const handleLeadCaptured = (lead: any) => {
    setCapturedLead(lead);
    // Simulate email trigger
    console.log("Triggering email to planify911@gmail.com with lead:", lead);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-sm bg-black/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-bold text-sm">P</div>
          <span className="text-xl font-light tracking-[0.2em] uppercase">Planify</span>
        </div>
        
        <div className="hidden md:flex space-x-12 text-xs uppercase tracking-widest font-medium text-gray-400">
          <a href="#philosophy" className="hover:text-white transition-colors">Philosophy</a>
          <a href="#projects" className="hover:text-white transition-colors">Projects</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center space-y-8 text-2xl font-light tracking-widest uppercase"
          >
            <a href="#philosophy" onClick={() => setIsMenuOpen(false)}>Philosophy</a>
            <a href="#projects" onClick={() => setIsMenuOpen(false)}>Projects</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center px-6 md:px-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/architecture/1920/1080?grayscale" 
            alt="Minimalist Architecture" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm uppercase tracking-[0.5em] text-gray-400 mb-4">Crafting Tomorrow, Today</h2>
            <h1 className="text-6xl md:text-8xl font-light leading-tight tracking-tighter">
              Live <span className="italic font-serif">Minimalism.</span><br />
              Functional <span className="text-gray-500">Design.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-400 max-w-xl font-light leading-relaxed"
          >
            Because every great space starts with a thoughtful plan. We blend natural materials with modern functionality to create spaces that breathe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button 
              onClick={() => setShowConsultation(true)}
              className="group px-10 py-4 bg-white text-black rounded-full font-medium flex items-center justify-center space-x-3 hover:bg-gray-200 transition-all"
            >
              <span>Start Design Consultation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#projects"
              className="px-10 py-4 border border-white/20 rounded-full font-medium flex items-center justify-center hover:bg-white/5 transition-all"
            >
              View Portfolio
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-px h-12 bg-white" />
        </div>
      </section>

      {/* Voice Consultation Modal */}
      <AnimatePresence>
        {showConsultation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <div className="relative w-full max-w-2xl">
              <button 
                onClick={() => setShowConsultation(false)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              
              {!capturedLead ? (
                <AriaVoiceAgent onLeadCaptured={handleLeadCaptured} />
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white p-12 rounded-3xl text-black space-y-8"
                >
                  <div className="flex items-center space-x-4 text-emerald-600">
                    <CheckCircle2 className="w-12 h-12" />
                    <h2 className="text-3xl font-light">Lead Captured</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gray-100">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Name</p>
                      <p className="text-xl font-medium">{capturedLead.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Project Type</p>
                      <p className="text-xl font-medium">{capturedLead.projectType}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Location</p>
                      <p className="text-xl font-medium">{capturedLead.location}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Timeline</p>
                      <p className="text-xl font-medium">{capturedLead.timeline}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 italic">
                      "Aria has compiled your brief and sent it to our design team at planify911@gmail.com. We'll reach out to you shortly."
                    </p>
                    <button 
                      onClick={() => setShowConsultation(false)}
                      className="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <section id="about" className="py-24 px-6 md:px-24 bg-white text-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-5xl font-light">10+</h3>
            <p className="text-sm uppercase tracking-widest text-gray-500">Years of Experience</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-5xl font-light">180+</h3>
            <p className="text-sm uppercase tracking-widest text-gray-500">Happy Clients</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-5xl font-light">35+</h3>
            <p className="text-sm uppercase tracking-widest text-gray-500">Design Awards</p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 px-6 md:px-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-sm uppercase tracking-[0.5em] text-gray-500">Our Philosophy</h2>
          <p className="text-3xl md:text-5xl font-light leading-tight">
            We believe that architecture is not just about buildings, but about <span className="text-gray-500">enhancing the human experience</span> through thoughtful planning and natural materials.
          </p>
          <div className="flex justify-center space-x-12 pt-8">
            <div className="flex flex-col items-center space-y-2">
              <Building2 className="w-8 h-8 text-gray-600" />
              <span className="text-[10px] uppercase tracking-widest">Commercial</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Home className="w-8 h-8 text-gray-600" />
              <span className="text-[10px] uppercase tracking-widest">Residential</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="w-8 h-8 text-gray-600" />
              <span className="text-[10px] uppercase tracking-widest">Urban</span>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="py-32 px-6 md:px-24 bg-white text-black">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-[0.5em] text-gray-500">Selected Works</h2>
            <h3 className="text-4xl font-light">Iconic Projects</h3>
          </div>
          <button className="hidden md:block text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
            View All Projects
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-6">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-light mb-1">{project.title}</h4>
                  <p className="text-sm text-gray-500">{project.location} — {project.type}</p>
                </div>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-24 px-6 md:px-24 bg-black border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-bold text-sm">P</div>
              <span className="text-xl font-light tracking-[0.2em] uppercase">Planify</span>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              Greater Noida (HQ), serving Noida, Delhi, Ghaziabad, Meerut, and Dehradun.
              Crafting spaces that resonate with your soul.
            </p>
            <div className="flex space-x-6">
              <Instagram className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
              <Mail className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-xs uppercase tracking-[0.3em] text-white">Contact</h5>
            <div className="space-y-4 text-gray-500 text-sm">
              <p className="flex items-center space-x-3">
                <Mail className="w-4 h-4" />
                <span>planify911@gmail.com</span>
              </p>
              <p className="flex items-center space-x-3">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" />
                <span>Greater Noida, UP, India</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-xs uppercase tracking-[0.3em] text-white">Leadership</h5>
            <div className="space-y-2 text-gray-500 text-sm">
              <p>Ar. Siddhant — Founder</p>
              <p>Ar. Vanshika Bangari — Co-founder</p>
              <p>Er. Megha Bangari — Civil Engineer</p>
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-gray-600">
          <p>© 2024 Planify Architecture. All Rights Reserved.</p>
          <p>Designed for Excellence</p>
        </div>
      </footer>
    </div>
  );
}
