import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { chatService, documentService, ChatMessage } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your LegalRAG assistant. You can ask me questions about legal procedures, case laws, or upload documents for analysis. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Convert messages to API format
      const history: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await chatService.query(input, history);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please ensure the backend is running and try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await documentService.upload(file);
      const systemMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Successfully uploaded and indexed document: ${file.name}. You can now ask questions about it.`
      };
      setMessages(prev => [...prev, systemMsg]);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Failed to upload ${file.name}. Please try again.`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full border border-slate-200 dark:border-slate-700 transition-colors duration-300">

        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">Legal Assistant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by RAG + Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
            />
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={triggerFileUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-bl-none'
                }`}>
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-600">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-500 cursor-pointer transition-colors">
                          <FileText className="w-3 h-3 mr-1" />
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <button
              className="absolute left-3 p-2 text-slate-400 hover:text-blue-500 transition-colors"
              onClick={triggerFileUpload}
              disabled={isUploading}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a legal question..."
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};