import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BookOpen, Sparkles, Scale, Brain, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, desc: string, color: string }> = ({ icon: Icon, title, desc, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 dark:bg-${color}-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
    <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center mb-4 relative z-10`}>
      <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed relative z-10">{desc}</p>
  </div>
);

const LegalTrivia: React.FC = () => {
    const facts = [
        "In India, you can report a crime at any police station, regardless of where the crime occurred (Zero FIR).",
        "The Supreme Court of India is the guardian of the Constitution.",
        "Under the Motor Vehicles Act, you don't need to carry physical documents if you have them in DigiLocker.",
        "A police officer cannot refuse to lodge an FIR for a cognizable offense.",
        "Indian law allows a person to defend their property against trespassers using reasonable force."
    ];
    const [index, setIndex] = useState(0);
    const [animate, setAnimate] = useState(false);

    const nextFact = () => {
        setAnimate(true);
        setTimeout(() => {
            setIndex((prev) => (prev + 1) % facts.length);
            setAnimate(false);
        }, 300);
    };

    return (
        <div className="bg-indigo-900 dark:bg-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-indigo-800">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="relative z-10">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Brain className="w-6 h-6 text-yellow-400 mr-2" />
                        <h3 className="font-bold text-lg tracking-wide">DID YOU KNOW?</h3>
                    </div>
                    <button onClick={nextFact} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <RefreshCw className="w-5 h-5 text-indigo-200" />
                    </button>
                 </div>
                 <div className={`min-h-[80px] flex items-center text-lg sm:text-xl font-medium leading-relaxed transition-opacity duration-300 ${animate ? 'opacity-0' : 'opacity-100'}`}>
                    "{facts[index]}"
                 </div>
             </div>
        </div>
    );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 overflow-hidden transition-colors duration-300">
        {/* Animated Blobs */}
        <div className="blob w-[500px] h-[500px] bg-blue-300 dark:bg-blue-600/30 top-[-10%] left-[-10%] animate-float"></div>
        <div className="blob w-[400px] h-[400px] bg-purple-300 dark:bg-purple-600/30 bottom-[-10%] right-[-5%] animate-float-delayed"></div>
        <div className="blob w-[300px] h-[300px] bg-pink-200 dark:bg-pink-600/20 top-[40%] left-[40%] animate-float" style={{ animationDuration: '8s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-bold mb-6 animate-pulse">
                <Sparkles className="w-4 h-4 mr-2" /> 
                AI-Powered Legal Research
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                Navigate the Law <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  at Light Speed
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Your intelligent companion for summarizing documents, finding case laws, and simplifying complex legal jargon. Fast, accurate, and secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                    size="lg" 
                    className="shadow-xl shadow-blue-500/20 px-8 animate-bounce hover:animate-none dark:shadow-blue-900/40" 
                    style={{ animationDuration: '2s' }}
                    onClick={() => navigate('/chat')}
                >
                  Try AI Assistant <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm" onClick={() => navigate('/advocates')}>
                  Find an Advocate
                </Button>
              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start space-x-8 text-slate-400 dark:text-slate-500">
                <div className="flex items-center"><Shield className="w-4 h-4 mr-1" /> Secure</div>
                <div className="flex items-center"><Zap className="w-4 h-4 mr-1" /> Fast</div>
                <div className="flex items-center"><Scale className="w-4 h-4 mr-1" /> Accurate</div>
              </div>
            </div>

            {/* Hero Graphic */}
            <div className="relative hidden lg:block">
               <div className="relative rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0"></div>
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-none p-3 text-sm text-slate-700 dark:text-slate-200 w-3/4">
                           Can you summarize the key points of the Data Protection Act 2023?
                        </div>
                     </div>
                     <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 text-sm w-3/4 shadow-lg">
                           Certainly! The 2023 Act focuses on data fiduciary obligations, user consent, and establishes a Data Protection Board...
                        </div>
                     </div>
                     <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
               </div>
               {/* Floating Elements */}
               <div className="absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg animate-bounce border border-slate-100 dark:border-slate-700">
                  <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
               </div>
               <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg animate-bounce border border-slate-100 dark:border-slate-700" style={{ animationDelay: '1s' }}>
                  <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Choose LegalRAG?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              We combine advanced Retrieval-Augmented Generation with deep legal datasets to give you superpowers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap} 
              title="Instant Summaries" 
              desc="Upload 50-page court judgments and get a clear, concise summary in seconds. No more late-night reading."
              color="blue"
            />
            <FeatureCard 
              icon={BookOpen} 
              title="Case Law Search" 
              desc="Find relevant precedents using natural language. Just describe the situation, and we find the case."
              color="indigo"
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure & Private" 
              desc="Your documents are encrypted and processed securely. We prioritize client confidentiality above all."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Fun/Trivia Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                   <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Learn Something New</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">
                      Law isn't just about rules; it's about knowing your rights. Expand your legal knowledge one fact at a time.
                   </p>
                   <Button variant="outline" onClick={() => navigate('/news')}>Read Daily Updates</Button>
                </div>
                <LegalTrivia />
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to simplify your legal workflow?</h2>
            <p className="text-slate-400 text-xl mb-10">Join thousands of legal professionals and students using LegalRAG today.</p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full shadow-lg shadow-blue-900/50 transform hover:scale-105 transition-transform" onClick={() => navigate('/chat')}>
                Get Started for Free
            </Button>
         </div>
      </section>
    </div>
  );
};