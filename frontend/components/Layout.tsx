import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X, Home, Users, FileText, MapPin, Sparkles, Sun, Moon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Assistant', path: '/chat', icon: Sparkles },
    { label: 'News', path: '/news', icon: FileText },
    { label: 'Find Advocates', path: '/advocates', icon: MapPin },
    { label: 'About', path: '/about', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <Scale className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">Legal<span className="text-blue-600">RAG</span></span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              {navItems.map((item) => {
                const isActive = item.path === '/' 
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
                  
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-blue-500 text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Theme Toggle Desktop */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden space-x-4">
               <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                 const isActive = item.path === '/' 
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                 return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                 <Scale className="h-6 w-6 text-blue-500" />
                 <span className="ml-2 text-lg font-bold text-white">LegalRAG</span>
              </div>
              <p className="text-sm text-slate-400">
                Making legal research accessible and understandable through advanced AI technology.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/news" className="hover:text-blue-400 transition-colors">Legal Updates</Link></li>
                <li><Link to="/advocates" className="hover:text-blue-400 transition-colors">Find an Advocate</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><span className="text-slate-500">Not Legal Advice</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} LegalRAG. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};