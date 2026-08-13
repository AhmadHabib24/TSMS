'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Scissors, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// We use raw axios because this is public, we don't want the auth interceptors from lib/axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

export default function PublicBookingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  const [step, setStep] = useState(1);
  const [selectionType, setSelectionType] = useState<'service' | 'package'>('service');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [setRes, srvRes, pkgRes] = await Promise.all([
        api.get('/api/public/booking/settings'),
        api.get('/api/public/booking/services'),
        api.get('/api/public/booking/packages')
      ]);
      setSettings(setRes.data);
      setServices(srvRes.data);
      setPackages(pkgRes.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Online booking is currently disabled for this business.');
      } else {
        setError('Failed to load booking page. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedId) {
      toast.error('Please select an option to continue.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        ...formData
      };
      
      if (selectionType === 'service') {
        payload.service_id = selectedId;
      } else {
        payload.package_id = selectedId;
      }

      await api.post('/api/public/booking/book', payload);
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading booking experience...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-4">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Unavailable</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-4">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-gray-400 mb-8 max-w-md">Thank you, {formData.customer_name}. We have received your booking request for {formData.booking_date} at {formData.booking_time}. We will see you soon!</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[var(--color-gold)] text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors">
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-[#121212] border-b border-[#333333] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center gap-4">
          {settings.business_logo && (
            <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${settings.business_logo}`} alt="Logo" className="h-10 object-contain" />
          )}
          <h1 className="text-xl font-bold tracking-widest text-[var(--color-gold)] uppercase">{settings.business_name}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8 md:py-12">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-12">
          <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-[var(--color-gold)]' : 'text-gray-600'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 1 ? 'bg-[var(--color-gold)] text-black' : 'bg-[#222]'}`}>1</div>
            <span className="text-xs font-bold uppercase tracking-wider">Select</span>
          </div>
          <div className={`w-24 h-1 mx-2 ${step >= 2 ? 'bg-[var(--color-gold)]' : 'bg-[#222]'}`} />
          <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-[var(--color-gold)]' : 'text-gray-600'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 2 ? 'bg-[var(--color-gold)] text-black' : 'bg-[#222]'}`}>2</div>
            <span className="text-xs font-bold uppercase tracking-wider">Details</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">What do you need today?</h2>
              <p className="text-gray-400">Choose a service or package to get started.</p>
            </div>

            {/* Type Selector */}
            <div className="flex bg-[#1a1a1a] p-1 rounded-xl w-fit mx-auto border border-[#333333]">
              <button 
                onClick={() => { setSelectionType('service'); setSelectedId(null); }}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${selectionType === 'service' ? 'bg-[#333] text-white shadow' : 'text-gray-500 hover:text-white'}`}
              >
                <Scissors size={16}/> Services
              </button>
              <button 
                onClick={() => { setSelectionType('package'); setSelectedId(null); }}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${selectionType === 'package' ? 'bg-[#333] text-white shadow' : 'text-gray-500 hover:text-white'}`}
              >
                <Package size={16}/> Packages
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectionType === 'service' ? (
                services.length === 0 ? <p className="col-span-2 text-center text-gray-500 py-8">No services available.</p> :
                services.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => setSelectedId(s.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedId === s.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[#333] bg-[#1a1a1a] hover:border-gray-500'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{s.name}</h3>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedId === s.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black' : 'border-gray-600'}`}>
                        {selectedId === s.id && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={14}/> {s.duration_minutes} min</span>
                      <span className="font-mono text-[var(--color-gold)] font-bold">Rs {Number(s.price).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                packages.length === 0 ? <p className="col-span-2 text-center text-gray-500 py-8">No packages available.</p> :
                packages.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedId(p.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedId === p.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[#333] bg-[#1a1a1a] hover:border-gray-500'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedId === p.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black' : 'border-gray-600'}`}>
                        {selectedId === p.id && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-[var(--color-gold)] font-bold font-mono">
                      Rs {Number(p.price).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-8 border-t border-[#333]">
              <button 
                onClick={handleNext}
                disabled={!selectedId}
                className="px-8 py-4 bg-[var(--color-gold)] text-black font-black text-lg rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,179,8,0.2)]"
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Your Details</h2>
              <p className="text-gray-400">Please provide your contact information and preferred time.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#333] p-6 md:p-8 rounded-3xl space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                  <input required type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Phone Number</label>
                  <input required type="tel" name="customer_phone" value={formData.customer_phone} onChange={handleChange} className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors" placeholder="e.g. 03001234567" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input required type="date" name="booking_date" value={formData.booking_date} onChange={handleChange} className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 pl-12 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input required type="time" name="booking_time" value={formData.booking_time} onChange={handleChange} className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 pl-12 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Special Requests (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors" placeholder="Any specific requirements..."></textarea>
              </div>

              <div className="flex gap-4 pt-6 border-t border-[#333]">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:bg-[#222] transition-colors border border-[#333]">
                  Back
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[var(--color-gold)] text-black font-black text-lg rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>

            </form>
          </div>
        )}
      </main>
    </div>
  );
}
