'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Blocks, CheckCircle2, ShoppingCart, Upload, X } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

export default function AddonsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [masterSettings, setMasterSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  const [selectedAddon, setSelectedAddon] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const [interval, setInterval] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('qr_manual');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { hasAddon } = usePermissions();

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      const res = await api.get('/addons/available');
      setAddons(res.data.addons || []);
      setMasterSettings(res.data.settings || {});
    } catch (error) {
      console.error("Failed to fetch addons", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = () => {
    if (!selectedAddon) return 0;
    if (interval === 'six_months') return selectedAddon.six_months_price;
    if (interval === 'twelve_months') return selectedAddon.twelve_months_price;
    return selectedAddon.monthly_price;
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddon) return;

    if (paymentMethod === 'qr_manual' && !paymentProof) {
      toast.error("Please upload a screenshot of your payment receipt.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('addon_plan_id', selectedAddon.id);
      formData.append('payment_method', paymentMethod);
      formData.append('interval', interval);
      formData.append('price_paid', getPrice().toString());
      
      if (paymentProof) {
        formData.append('payment_proof', paymentProof);
      }

      await api.post('/addons/purchase', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Purchase request submitted successfully! Pending admin approval.");
      setShowPurchaseModal(false);
      setSelectedAddon(null);
      setPaymentProof(null);
      setInterval('monthly');
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit purchase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Addons Marketplace</h1>
        <p className="text-gray-400 mt-1">Supercharge your system with premium extra features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading available addons...</div>
        ) : addons.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No addons available at the moment.</div>
        ) : addons.map((addon) => {
          const isActive = hasAddon(addon.identifier);
          return (
            <div key={addon.id} className={`bg-[#1e1e1e] border ${isActive ? 'border-yellow-500' : 'border-[#333333]'} rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-yellow-500/50 transition-colors`}>
              {isActive && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </div>
              )}
              
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 rounded-2xl flex items-center justify-center text-yellow-500 mb-6">
                <Blocks size={28} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{addon.name}</h3>
              <p className="text-sm text-gray-400 mb-8 flex-1 leading-relaxed">{addon.description}</p>
              
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Starting from</p>
                  <p className="text-2xl font-bold text-white">Rs {Number(addon.monthly_price).toLocaleString()} <span className="text-sm text-gray-500 font-normal">/mo</span></p>
                </div>
                {!isActive ? (
                  <button 
                    onClick={() => {
                      setSelectedAddon(addon);
                      setShowPurchaseModal(true);
                    }}
                    className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                  >
                    <ShoppingCart size={16} /> Buy Now
                  </button>
                ) : (
                  <button disabled className="bg-[#333333] text-gray-400 px-4 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed">
                    Purchased
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showPurchaseModal && selectedAddon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-[#333333] flex justify-between items-center bg-[#1a1a1a]">
              <div>
                <h3 className="font-bold text-lg text-white">Purchase Addon</h3>
                <p className="text-xs text-yellow-500 font-medium">{selectedAddon.name}</p>
              </div>
              <button onClick={() => setShowPurchaseModal(false)} className="text-gray-500 hover:text-white transition-colors bg-[#2a2a2a] p-1.5 rounded-lg"><X size={20} /></button>
            </div>
            
            <form onSubmit={handlePurchaseSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Billing Cycle Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-300">Select Billing Cycle</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${interval === 'monthly' ? 'border-yellow-500 bg-yellow-500/10' : 'border-[#333333] bg-[#121212] hover:border-gray-600'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="interval" value="monthly" checked={interval === 'monthly'} onChange={(e) => setInterval(e.target.value)} className="accent-yellow-500 w-4 h-4" />
                      <span className="text-sm font-medium text-white">1 Month</span>
                    </div>
                    <span className="font-bold text-white">Rs {Number(selectedAddon.monthly_price).toLocaleString()}</span>
                  </label>
                  
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${interval === 'six_months' ? 'border-yellow-500 bg-yellow-500/10' : 'border-[#333333] bg-[#121212] hover:border-gray-600'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="interval" value="six_months" checked={interval === 'six_months'} onChange={(e) => setInterval(e.target.value)} className="accent-yellow-500 w-4 h-4" />
                      <span className="text-sm font-medium text-white">6 Months</span>
                    </div>
                    <span className="font-bold text-white">Rs {Number(selectedAddon.six_months_price).toLocaleString()}</span>
                  </label>
                  
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${interval === 'twelve_months' ? 'border-yellow-500 bg-yellow-500/10' : 'border-[#333333] bg-[#121212] hover:border-gray-600'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="interval" value="twelve_months" checked={interval === 'twelve_months'} onChange={(e) => setInterval(e.target.value)} className="accent-yellow-500 w-4 h-4" />
                      <span className="text-sm font-medium text-white">12 Months</span>
                    </div>
                    <span className="font-bold text-white">Rs {Number(selectedAddon.twelve_months_price).toLocaleString()}</span>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-300">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className={`p-3 rounded-xl border text-sm font-medium transition-colors ${paymentMethod === 'qr_manual' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-[#333333] bg-[#121212] text-gray-400'}`}>
                    Easypaisa / Bank (Manual)
                  </button>
                  <button type="button" disabled className="p-3 rounded-xl border border-[#333333] bg-[#121212] text-gray-600 text-sm font-medium cursor-not-allowed opacity-50 relative group">
                    Card (Stripe)
                    <span className="absolute -top-2 -right-2 bg-[#333333] text-[9px] px-1.5 py-0.5 rounded text-gray-400">Soon</span>
                  </button>
                </div>
              </div>

              {/* QR Code / Details block */}
              {paymentMethod === 'qr_manual' && (
                <div className="bg-[#121212] border border-[#333333] rounded-xl p-4 space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Total to Pay</p>
                    <p className="text-3xl font-black text-yellow-500">Rs {getPrice().toLocaleString()}</p>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                    <p className="mb-1"><strong>1.</strong> Send the exact amount to the details below.</p>
                    <p className="mb-1"><strong>2.</strong> Take a screenshot of the successful transaction.</p>
                    <p><strong>3.</strong> Upload the screenshot below to activate.</p>
                  </div>
                  
                  <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333333] text-sm text-gray-300 space-y-1 font-mono">
                    <p><span className="text-gray-500">Bank / Wallet:</span> {masterSettings.bank_name || 'N/A'}</p>
                    <p><span className="text-gray-500">Title:</span> {masterSettings.account_title || 'N/A'}</p>
                    <p><span className="text-gray-500">Account No:</span> {masterSettings.account_number || 'N/A'}</p>
                  </div>
                  
                  {masterSettings.qr_image_path && (
                    <div className="flex justify-center my-4">
                      <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('8000', '8001')}/storage/${masterSettings.qr_image_path}`} alt="QR Code" className="w-32 h-32 object-contain bg-white rounded-lg p-1" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Upload Receipt</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#333333] border-dashed rounded-xl cursor-pointer hover:bg-[#252525] transition-colors group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload size={24} className="text-gray-500 mb-2 group-hover:text-yellow-500 transition-colors" />
                        <p className="text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                    {paymentProof && (
                      <p className="text-sm text-green-500 mt-2 font-medium flex items-center gap-1"><CheckCircle2 size={14}/> {paymentProof.name}</p>
                    )}
                  </div>
                </div>
              )}
            </form>
            
            <div className="p-5 border-t border-[#333333] bg-[#1a1a1a]">
              <button 
                type="submit" 
                onClick={handlePurchaseSubmit}
                disabled={isSubmitting || (paymentMethod === 'qr_manual' && !paymentProof)}
                className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Purchase Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
