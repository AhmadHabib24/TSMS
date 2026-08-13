'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Ticket as TicketIcon, CheckCircle2, MessageSquareText, Mail, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SupportTicketsPage() {
  const { hasAddon } = usePermissions();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id: number, updates: any) => {
    try {
      await api.put(`/tickets/${id}`, updates);
      toast.success('Ticket updated successfully');
      fetchTickets();
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({ ...selectedTicket, ...updates });
      }
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const handleSaveNotes = () => {
    if (!selectedTicket) return;
    updateTicket(selectedTicket.id, { admin_notes: adminNotes });
  };

  if (!hasAddon('fast_support')) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <HelpCircle size={48} className="text-gray-600" />
        <h2 className="text-2xl font-bold text-white">Fast Support Addon Required</h2>
        <p className="text-gray-400">You need to purchase the Fast Support addon to access this feature.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-auto md:h-[calc(100vh-80px)]">
      
      {/* Tickets List (Left Sidebar) */}
      <div className="w-full md:w-1/3 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl flex flex-col h-full">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TicketIcon size={20} className="text-[var(--color-gold)]" /> Support Tickets
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {loading ? (
            <div className="text-center p-4 text-gray-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No tickets found.</div>
          ) : (
            tickets.map((ticket: any) => (
              <button 
                key={ticket.id} 
                onClick={() => { setSelectedTicket(ticket); setAdminNotes(ticket.admin_notes || ''); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTicket?.id === ticket.id 
                    ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)]/50' 
                    : 'bg-[#121212] border-[var(--color-border)] hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-500' :
                    ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' :
                    ticket.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">#{ticket.id}</span>
                </div>
                <h3 className="font-medium text-white line-clamp-1 mb-1">{ticket.subject}</h3>
                <p className="text-xs text-gray-400 line-clamp-1">{ticket.customer_name}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ticket Details (Right Section) */}
      <div className="w-full md:w-2/3 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl flex flex-col h-full relative overflow-hidden">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-[var(--color-border)] bg-[#121212]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedTicket.subject}</h2>
                <div className="flex gap-2">
                  <select 
                    value={selectedTicket.status} 
                    onChange={(e) => updateTicket(selectedTicket.id, { status: e.target.value })}
                    className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-gold)]"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={16} className="text-gray-500" /> {selectedTicket.customer_email}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={16} className="text-gray-500" /> {new Date(selectedTicket.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* Customer Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-bold uppercase tracking-wider">
                  <MessageSquareText size={16} /> Customer Issue
                </div>
                <div className="bg-[#121212] border border-[var(--color-border)] p-5 rounded-xl text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2 pt-6 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-2"><ShieldCheck size={16} /> Internal Admin Notes</div>
                  <button onClick={handleSaveNotes} className="bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black font-bold px-3 py-1 rounded text-xs transition-colors">
                    Save Notes
                  </button>
                </div>
                <textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-[#121212] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-gold)] transition-colors min-h-[150px]"
                  placeholder="Leave private notes about resolving this issue..."
                />
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <TicketIcon size={48} className="mb-4 opacity-50" />
            <p>Select a ticket from the left to view details</p>
          </div>
        )}
      </div>

    </div>
  );
}
