'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function SupportWidget({ themeColor = '#eab308' }: { themeColor?: string }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    message: ''
  });
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/public/tickets', formData);
      setSubmittedTicket(res.data.ticket.ticket_number);
      toast.success('Your support ticket has been submitted!');
      setFormData({
        customer_name: '',
        customer_email: '',
        subject: '',
        message: ''
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-black text-gray-900">Ticket Submitted!</h3>
        <p className="text-gray-600">Your ticket has been generated successfully. You can track its status at any time.</p>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-bold text-gray-500 mb-1">Your Ticket Number</p>
          <p className="text-2xl font-black text-gray-900 tracking-wider">{submittedTicket}</p>
        </div>
        <p className="text-sm text-gray-500">You can ask our AI assistant to track this ticket number for you!</p>
        <button onClick={() => setSubmittedTicket(null)} className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-colors">
          Submit Another Ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-xl mx-auto text-left space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
          <input required type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input required type="email" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors" placeholder="john@example.com" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
        <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors" placeholder="How can we help?" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
        <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors min-h-[150px]" placeholder="Please describe your issue in detail..."></textarea>
      </div>

      <button disabled={loading} type="submit" className="w-full py-4 rounded-xl font-black text-white text-lg transition-transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:hover:scale-100" style={{ backgroundColor: themeColor }}>
        {loading ? 'Submitting...' : 'Submit Support Ticket'}
      </button>
    </form>
  );
}
