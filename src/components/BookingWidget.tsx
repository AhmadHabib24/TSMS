'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function BookingWidget({ themeColor = '#eab308' }: { themeColor?: string }) {
  const [services, setServices] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    booking_date: '',
    booking_time: '',
    service_id: '',
    package_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [svcRes, pkgRes] = await Promise.all([
        api.get('/public/booking/services'),
        api.get('/public/booking/packages'),
      ]);
      setServices(svcRes.data || []);
      setPackages(pkgRes.data || []);
    } catch (e) {
      console.error('Failed to load booking data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/public/booking/book', formData);
      setSubmittedBooking(res.data.booking.booking_number);
      toast.success('Booking confirmed successfully!');
      setFormData({
        customer_name: '',
        customer_phone: '',
        booking_date: '',
        booking_time: '',
        service_id: '',
        package_id: '',
        notes: ''
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading available packages...</div>;
  }

  if (submittedBooking) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-black text-gray-900">Booking Confirmed!</h3>
        <p className="text-gray-600">Your appointment has been booked successfully. You can track your booking status using your Booking ID.</p>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-bold text-gray-500 mb-1">Your Booking ID</p>
          <p className="text-2xl font-black text-gray-900 tracking-wider">{submittedBooking}</p>
        </div>
        <p className="text-sm text-gray-500">You can ask our AI assistant to track this booking ID for you!</p>
        <button onClick={() => setSubmittedBooking(null)} className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-colors">
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto text-left space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <input required type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
          <input required type="tel" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors" placeholder="+1 234 567 890" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
          <input required type="date" value={formData.booking_date} onChange={e => setFormData({...formData, booking_date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
          <input required type="time" value={formData.booking_time} onChange={e => setFormData({...formData, booking_time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Service or Package</label>
        <select required value={formData.package_id ? `pkg_${formData.package_id}` : (formData.service_id ? `svc_${formData.service_id}` : '')} onChange={e => {
          const val = e.target.value;
          if (val.startsWith('pkg_')) {
            setFormData({...formData, package_id: val.replace('pkg_', ''), service_id: ''});
          } else if (val.startsWith('svc_')) {
            setFormData({...formData, service_id: val.replace('svc_', ''), package_id: ''});
          } else {
            setFormData({...formData, package_id: '', service_id: ''});
          }
        }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors">
          <option value="">-- Choose what to book --</option>
          
          {services.length > 0 && (
            <optgroup label="Services">
              {services.map((svc: any) => (
                <option key={`svc_${svc.id}`} value={`svc_${svc.id}`}>
                  {svc.name} - Rs {svc.price} ({svc.duration_minutes} min)
                </option>
              ))}
            </optgroup>
          )}

          {packages.length > 0 && (
            <optgroup label="Packages">
              {packages.map((pkg: any) => (
                <option key={`pkg_${pkg.id}`} value={`pkg_${pkg.id}`}>
                  {pkg.name} - Rs {pkg.price}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes (Optional)</label>
        <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 transition-colors min-h-[100px]" placeholder="Any special requests..."></textarea>
      </div>

      <button disabled={submitting} type="submit" className="w-full py-4 rounded-xl font-black text-white text-lg transition-transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:hover:scale-100" style={{ backgroundColor: themeColor }}>
        {submitting ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
