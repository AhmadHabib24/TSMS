'use client';
import React, { useState, useEffect } from 'react';
import { Percent, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function PromotionsPage() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { can } = usePermissions();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    code: string; 
    discount_type: 'percentage' | 'fixed'; 
    discount_value: string; 
    start_date: string; 
    end_date: string; 
    is_active: boolean
  }>({ 
    code: '', discount_type: 'percentage', discount_value: '', start_date: '', end_date: '', is_active: true
  });

  const fetchData = () => {
    api.get('/promotions').then(res => setData(res.data)).catch(() => console.warn('Promotions API not ready yet.'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/promotions/${editingId}`, formData);
        toast.success('Updated successfully!');
      } else {
        await api.post('/promotions', formData);
        toast.success('Added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      try {
        await api.delete(`/promotions/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        code: item.code || '', 
        discount_type: item.discount_type || 'percentage', 
        discount_value: item.discount_value || '',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        is_active: item.is_active ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', start_date: '', end_date: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Percent className="text-[var(--color-gold)] w-6 h-6 md:w-8 md:h-8" /> Promo Codes</h1>
        {can('services', 'add') && (
          <button onClick={() => openModal()} className="w-full sm:w-auto justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base"><Plus size={20} /> Add Promo</button>
        )}
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left whitespace-nowrap min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-gray-400">
              <th className="pb-3">Promo Code</th>
              <th className="pb-3">Discount</th>
              <th className="pb-3">Validity</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="py-3 sm:py-4 pr-4">
                  <span className="bg-gray-800 text-[var(--color-gold)] font-mono px-2 py-1 rounded border border-[var(--color-border)] font-bold tracking-widest">{item.code}</span>
                </td>
                <td className="py-3 sm:py-4 pr-4 font-bold text-[var(--color-foreground)]">
                  {item.discount_type === 'percentage' ? `${item.discount_value}% OFF` : `₨ ${item.discount_value} OFF`}
                </td>
                <td className="py-3 sm:py-4 pr-4 text-xs text-gray-400">
                  {item.start_date ? item.start_date : 'Always'} - {item.end_date ? item.end_date : 'Forever'}
                </td>
                <td className="py-3 sm:py-4 pr-4">
                  {item.is_active ? 
                    <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider">Active</span> : 
                    <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider">Inactive</span>
                  }
                </td>
                <td className="py-3 sm:py-4 flex flex-wrap gap-2 sm:gap-3 items-center min-w-[100px]">
                  {can('services', 'edit') && (
                    <button onClick={() => openModal(item)} className="mr-0 sm:mr-3 text-gray-400 hover:text-[var(--color-foreground)] transition-colors p-1"><Edit size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                  )}
                  {can('services', 'delete') && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors p-1"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No promotions found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[var(--color-border)] shrink-0">
              <h2 className="text-lg sm:text-xl font-bold truncate pr-2">{editingId ? 'Edit Promo Code' : 'Add New Promo Code'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)] shrink-0"><X size={20} className="sm:w-6 sm:h-6" /></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto grow custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">Promo Code</label>
                  <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 font-mono font-bold tracking-widest uppercase text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" placeholder="e.g. SUMMER20" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">Discount Type</label>
                    <select required value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value as any})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none appearance-none">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₨)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">Discount Value</label>
                    <input required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} type="number" min="0" step="any" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">Start Date (Optional)</label>
                    <input value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} type="date" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">End Date (Optional)</label>
                    <input value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} type="date" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none text-gray-400" />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[var(--color-background)] border border-[var(--color-border)] p-3 sm:p-4 rounded-lg mt-2">
                  <div>
                    <div className="text-sm font-bold text-[var(--color-foreground)]">Active Status</div>
                    <div className="text-xs text-gray-400">Can this promo code be used?</div>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                    className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full cursor-pointer relative transition-colors shrink-0 ${formData.is_active ? 'bg-[var(--color-gold)]' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black transition-all ${formData.is_active ? 'left-7 sm:left-8' : 'left-1'}`}></div>
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-2.5 sm:py-3 rounded-lg font-bold mt-4 sm:mt-6 hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base">
                  {editingId ? 'Save Changes' : 'Create Promo Code'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
