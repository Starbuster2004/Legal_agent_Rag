import React, { useState } from 'react';
import { Shield, Users, Scale, Mail, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/Button';
import { MockService } from '../services/mockService';
import { TeamMember, FAQ } from '../types';

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center hover:shadow-md transition-all duration-300">
    <img src={member.photo_url} alt={member.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-slate-50 dark:border-slate-700" />
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</h3>
    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{member.role}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{member.bio}</p>
  </div>
);

const FAQItem: React.FC<{ faq: FAQ }> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-0">
      <button 
        className="w-full py-4 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base font-medium text-slate-800 dark:text-slate-200">{faq.q}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed animate-fadeIn">
          {faq.a}
        </div>
      )}
    </div>
  );
};

export const About: React.FC = () => {
  const team = MockService.getTeam();
  const faqs = MockService.getFAQs();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => {
        setFormStatus('success');
        setContactForm({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Democratizing Legal Intelligence
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Legal research summaries powered by retrieval + LLM. We bridge the gap between complex legal documents and clear, actionable insights.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Contact Us
            </Button>
            <Button size="lg" variant="outline">
              Read Disclaimer
            </Button>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 shadow-2xl text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
               <div className="flex items-center mb-4">
                 <Scale className="w-8 h-8 text-blue-200 mr-3" />
                 <h2 className="text-2xl font-bold">Our Mission</h2>
               </div>
               <p className="text-blue-100 text-lg leading-relaxed">
                 To empower individuals and legal professionals by reducing the time and cost of legal research through state-of-the-art Artificial Intelligence, ensuring justice is accessible to everyone.
               </p>
            </div>
            <div className="flex-shrink-0">
               <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                 <div className="text-4xl font-bold mb-1">500k+</div>
                 <div className="text-blue-200 text-sm">Documents Indexed</div>
               </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-700 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Meet the Team</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">The minds behind the machine.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map(member => <TeamCard key={member.id} member={member} />)}
        </div>
      </div>

      {/* FAQs & Contact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
              Frequently Asked Questions
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              {faqs.map((faq, idx) => <FAQItem key={idx} faq={faq} />)}
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
               <h4 className="text-amber-800 dark:text-amber-500 font-semibold text-sm flex items-center mb-2">
                 <Shield className="w-4 h-4 mr-2" /> Legal Disclaimer
               </h4>
               <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                 This platform is a research tool and does not constitute legal advice. The AI-generated summaries may contain errors. Please consult a qualified advocate for professional legal counsel.
               </p>
            </div>
          </div>

          {/* Contact Form */}
          <div id="contact">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
              Get in Touch
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              {formStatus === 'success' ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent!</h3>
                   <p className="text-slate-500 dark:text-slate-400 mt-2">We'll get back to you within 24 hours.</p>
                   <Button variant="outline" className="mt-6" onClick={() => setFormStatus('idle')}>Send another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input 
                      type="text" id="name" required 
                      className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={contactForm.name}
                      onChange={e => setContactForm({...contactForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input 
                      type="email" id="email" required 
                      className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={contactForm.email}
                      onChange={e => setContactForm({...contactForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                    <textarea 
                      id="message" rows={4} required 
                      className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={contactForm.message}
                      onChange={e => setContactForm({...contactForm, message: e.target.value})}
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full" isLoading={formStatus === 'sending'}>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};