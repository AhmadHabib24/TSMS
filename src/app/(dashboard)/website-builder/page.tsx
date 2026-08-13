'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Save, Plus, ArrowUp, ArrowDown, Trash2, LayoutTemplate, Image as ImageIcon, Type, Video, Link as LinkIcon, Settings, Ticket } from 'lucide-react';

type BlockType = 'hero' | 'text' | 'image' | 'video' | 'booking' | 'support';

interface Block {
  id: string;
  type: BlockType;
  content: any;
}

export default function WebsiteBuilderPage() {
  const { hasAddon } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isPublished, setIsPublished] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [settings, setSettings] = useState({ themeColor: '#eab308' });

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const res = await api.get('/landing-page');
      setIsPublished(res.data.is_published || false);
      setTitle(res.data.title || '');
      setDescription(res.data.description || '');
      setSettings(res.data.settings || { themeColor: '#eab308' });
      
      try {
        const parsedBlocks = typeof res.data.blocks === 'string' ? JSON.parse(res.data.blocks) : (res.data.blocks || []);
        setBlocks(Array.isArray(parsedBlocks) ? parsedBlocks : []);
      } catch (e) {
        setBlocks([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    setSaving(true);
    try {
      await api.post('/landing-page', {
        is_published: isPublished,
        title,
        description,
        blocks: JSON.stringify(blocks),
        settings
      });
      toast.success('Landing page saved successfully!');
    } catch (error) {
      toast.error('Failed to save landing page');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: getDefaultContent(type)
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: BlockType) => {
    switch (type) {
      case 'hero': return { heading: 'Welcome to our Business', subheading: 'We offer the best services in town.', buttonText: 'Book Now' };
      case 'text': return { text: 'Enter your text here...' };
      case 'image': return { url: '', alt: '' };
      case 'video': return { url: '' };
      case 'booking': return { title: 'Book an Appointment' };
      case 'support': return { title: 'Contact Support' };
      default: return {};
    }
  };

  const updateBlockContent = (id: string, newContent: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    }
    setBlocks(newBlocks);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  if (!hasAddon('landing_page')) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <LayoutTemplate size={48} className="text-gray-600" />
        <h2 className="text-2xl font-bold text-white">Landing Page Addon Required</h2>
        <p className="text-gray-400">You need to purchase the Landing Page Builder addon to access this feature.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-white">Loading builder...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Editor Main */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Landing Page Builder</h1>
          <button 
            onClick={savePage} 
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>

        <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublished} 
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded bg-[#121212] border-[#333333] text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
              />
              <span className="text-white font-medium">Publish Site</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Site Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Theme Color</label>
              <input type="color" value={settings.themeColor} onChange={(e) => setSettings({...settings, themeColor: e.target.value})} className="w-full h-10 bg-[#121212] border border-[#333333] rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Page Blocks</h2>
          {blocks.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-[#333333] rounded-2xl text-gray-500">
              No blocks added yet. Start by adding a Hero section!
            </div>
          )}

          {blocks.map((block, index) => (
            <div key={block.id} className="bg-[#1e1e1e] border border-[#333333] rounded-xl overflow-hidden">
              <div className="bg-[#2a2a2a] px-4 py-2 flex items-center justify-between border-b border-[#333333]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{block.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ArrowUp size={16} /></button>
                  <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ArrowDown size={16} /></button>
                  <button onClick={() => deleteBlock(block.id)} className="p-1 text-red-500 hover:text-red-400 ml-2"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {block.type === 'hero' && (
                  <>
                    <input type="text" placeholder="Heading" value={block.content.heading} onChange={e => updateBlockContent(block.id, {...block.content, heading: e.target.value})} className="w-full bg-[#121212] border border-[#333333] text-white font-bold text-xl rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]" />
                    <input type="text" placeholder="Subheading" value={block.content.subheading} onChange={e => updateBlockContent(block.id, {...block.content, subheading: e.target.value})} className="w-full bg-[#121212] border border-[#333333] text-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]" />
                    <input type="text" placeholder="Button Text" value={block.content.buttonText} onChange={e => updateBlockContent(block.id, {...block.content, buttonText: e.target.value})} className="w-full md:w-1/3 bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]" />
                  </>
                )}
                {block.type === 'text' && (
                  <textarea placeholder="Enter your text here..." value={block.content.text} onChange={e => updateBlockContent(block.id, {...block.content, text: e.target.value})} className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)] min-h-[100px]" />
                )}
                {block.type === 'image' && (
                  <>
                    <input type="text" placeholder="Image URL (e.g. https://example.com/img.jpg)" value={block.content.url} onChange={e => updateBlockContent(block.id, {...block.content, url: e.target.value})} className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]" />
                    {block.content.url && <img src={block.content.url} alt="Preview" className="h-32 object-contain rounded bg-black/50" />}
                  </>
                )}
                {block.type === 'video' && (
                  <input type="text" placeholder="YouTube Video URL" value={block.content.url} onChange={e => updateBlockContent(block.id, {...block.content, url: e.target.value})} className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]" />
                )}
                {block.type === 'booking' && (
                  <div className="bg-[#121212] border border-dashed border-[#333333] rounded-lg p-6 text-center text-gray-400">
                    <p className="font-medium text-white mb-1">Booking System Widget</p>
                    <p className="text-sm">This block will automatically display your live booking system to users.</p>
                  </div>
                )}
                {block.type === 'support' && (
                  <div className="bg-[#121212] border border-dashed border-[#333333] rounded-lg p-6 text-center text-gray-400">
                    <p className="font-medium text-white mb-1">Support Tickets Widget</p>
                    <p className="text-sm">This block will automatically display a contact form for users to open support tickets.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Tools */}
      <div className="w-full md:w-72 shrink-0 space-y-4 sticky top-8">
        <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Add Elements</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addBlock('hero')} className="flex flex-col items-center justify-center p-4 bg-[#2a2a2a] hover:bg-[#333333] border border-[#333333] rounded-xl transition-colors text-gray-300 hover:text-white">
              <LayoutTemplate size={24} className="mb-2" />
              <span className="text-xs font-medium">Hero</span>
            </button>
            <button onClick={() => addBlock('text')} className="flex flex-col items-center justify-center p-4 bg-[#2a2a2a] hover:bg-[#333333] border border-[#333333] rounded-xl transition-colors text-gray-300 hover:text-white">
              <Type size={24} className="mb-2" />
              <span className="text-xs font-medium">Text</span>
            </button>
            <button onClick={() => addBlock('image')} className="flex flex-col items-center justify-center p-4 bg-[#2a2a2a] hover:bg-[#333333] border border-[#333333] rounded-xl transition-colors text-gray-300 hover:text-white">
              <ImageIcon size={24} className="mb-2" />
              <span className="text-xs font-medium">Image</span>
            </button>
            <button onClick={() => addBlock('video')} className="flex flex-col items-center justify-center p-4 bg-[#2a2a2a] hover:bg-[#333333] border border-[#333333] rounded-xl transition-colors text-gray-300 hover:text-white">
              <Video size={24} className="mb-2" />
              <span className="text-xs font-medium">Video</span>
            </button>
          </div>
          
          <h3 className="text-white font-bold mt-8 mb-4">Integrations</h3>
          <button 
            onClick={() => addBlock('booking')} 
            disabled={!hasAddon('booking_system')}
            className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/20 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={!hasAddon('booking_system') ? "Requires Booking System Addon" : "Add Booking Widget"}
          >
            <Plus size={18} /> Booking System
          </button>
          
          <button 
            onClick={() => addBlock('support')} 
            disabled={!hasAddon('fast_support')}
            className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/20 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            title={!hasAddon('fast_support') ? "Requires Fast Support Addon" : "Add Support Widget"}
          >
            <Plus size={18} /> Fast Support Form
          </button>
        </div>
      </div>
    </div>
  );
}
