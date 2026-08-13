'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { MessageSquare, Save, Bot } from 'lucide-react';

export default function ChatbotSettingsPage() {
  const { hasAddon } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    system_prompt: '',
    greeting_message: '',
    theme_color: '#eab308'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/chatbot-settings');
      setFormData({
        system_prompt: res.data.system_prompt || '',
        greeting_message: res.data.greeting_message || 'Hi! How can I help you today?',
        theme_color: res.data.theme_color || '#eab308'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/chatbot-settings', formData);
      toast.success('Chatbot settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!hasAddon('ai_chatbot')) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <MessageSquare size={48} className="text-gray-600" />
        <h2 className="text-2xl font-bold text-white">AI Chatbot Addon Required</h2>
        <p className="text-gray-400">You need to purchase the AI Chatbot addon to access this feature.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-white">Loading settings...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Chatbot Training</h1>
          <p className="text-gray-400 mt-1">Configure your AI assistant's behavior, knowledge, and appearance.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-8">
        
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">Greeting Message</label>
          <input 
            type="text" 
            value={formData.greeting_message} 
            onChange={(e) => setFormData({...formData, greeting_message: e.target.value})}
            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-gold)] transition-colors" 
            placeholder="Hi! How can I help you today?" 
          />
          <p className="text-xs text-gray-500 mt-2">This is the first message the user sees when they open the chat.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">Theme Color</label>
          <input 
            type="color" 
            value={formData.theme_color} 
            onChange={(e) => setFormData({...formData, theme_color: e.target.value})}
            className="w-full h-12 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl cursor-pointer" 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">System Prompt & Business Knowledge</label>
          <textarea 
            value={formData.system_prompt} 
            onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-gold)] transition-colors min-h-[250px] font-mono text-sm leading-relaxed" 
            placeholder="You are a helpful assistant for [Business Name]. We offer the following services... Our hours are..."
          />
          <div className="bg-[var(--color-gold)]/10 text-[var(--color-gold)] p-4 rounded-xl mt-3 text-sm">
            <strong>Pro Tip:</strong> Be very descriptive here. Tell the AI your business name, operating hours, prices, services, and how it should talk to customers.
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black px-4 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
        >
          <Save size={20} /> {saving ? 'Saving Knowledge...' : 'Save AI Configuration'}
        </button>

      </form>
    </div>
  );
}
