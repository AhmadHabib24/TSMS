'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { CalendarClock, Check, X, Clock, CalendarDays, User, Phone, StickyNote } from 'lucide-react';

export default function BookingsManagerPage() {
  const { hasAddon } = usePermissions();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  if (!hasAddon('booking_system')) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <CalendarClock size={48} className="text-gray-600" />
        <h2 className="text-2xl font-bold text-white">Booking System Addon Required</h2>
        <p className="text-gray-400">You need to purchase the Booking System addon to access this feature.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Manager</h1>
          <p className="text-gray-400 mt-1">Manage appointments booked through your public landing page.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-white">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center p-12 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl text-gray-400">
          No bookings received yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
              <div className="bg-[#121212] p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                    booking.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {booking.status}
                  </div>
                  <span className="text-xs text-gray-500 font-mono">#{booking.id.toString().padStart(4, '0')}</span>
                </div>
                
                {booking.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateStatus(booking.id, 'confirmed')} className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded transition-colors" title="Confirm Booking">
                      <Check size={16} />
                    </button>
                    <button onClick={() => updateStatus(booking.id, 'cancelled')} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors" title="Cancel Booking">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {booking.status === 'confirmed' && (
                  <button onClick={() => updateStatus(booking.id, 'completed')} className="text-xs font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-3 py-1.5 rounded transition-colors">
                    Mark Completed
                  </button>
                )}
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-gold)] mb-1">
                      {booking.package ? booking.package.name : booking.service?.name || 'Custom Booking'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1"><CalendarDays size={14} /> {booking.booking_date}</div>
                      <div className="flex items-center gap-1"><Clock size={14} /> {booking.booking_time}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><User size={14} /> Customer</div>
                    <div className="text-white font-medium">{booking.customer_name}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><Phone size={14} /> Phone</div>
                    <div className="text-white font-medium">{booking.customer_phone}</div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-[#121212] rounded-lg p-3 text-sm text-gray-400 border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><StickyNote size={14} /> Notes</div>
                    {booking.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
