'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/public/chatbot-settings');
      if (res.data.active) {
        setIsActive(true);
        setSettings(res.data);
        setMessages([{ role: 'bot', text: res.data.greeting_message }]);
      }
    } catch (e) {
      console.error('Chatbot not available');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/public/chatbot-message', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am currently unavailable. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isActive || !settings) return null;

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        style={{ backgroundColor: settings.theme_color, color: '#fff' }}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="p-4 rounded-t-3xl flex items-center justify-between shadow-sm relative z-10" style={{ backgroundColor: settings.theme_color, color: '#fff' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold">AI Assistant</h3>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
              )}
              
              <div 
                className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-sm text-sm ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none prose prose-sm prose-p:my-0'
                }`}
              >
                {msg.role === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
              
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-white border border-gray-100 rounded-bl-none shadow-sm flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-4 bg-white rounded-b-3xl border-t border-gray-100 relative z-10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-gray-100 text-gray-800 rounded-full pl-6 pr-12 py-3 outline-none focus:ring-2 transition-shadow text-sm"
              style={{ '--tw-ring-color': settings.theme_color } as React.CSSProperties}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 rounded-full text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ backgroundColor: settings.theme_color }}
            >
              <Send size={16} className="translate-x-[1px] translate-y-[1px]" />
            </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-gray-400">
            Powered by AI Assistant
          </div>
        </form>
      </div>
    </>
  );
}
