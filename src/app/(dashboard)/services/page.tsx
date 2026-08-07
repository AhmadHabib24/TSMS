'use client';
import React, { useState, useEffect } from 'react';
import { Scissors, Plus, Edit, Trash2, X, Sparkles, Droplet, Wind, Zap, Star, Heart, Smile, Crown, Flower, Moon, Sun, Cloud, Flame, Gem, CircleDot, Activity, Coffee, Monitor, Music, Shield, Anchor, Award, Briefcase, Camera, Compass, Eye, Gift, Globe, Key, Map, MessageCircle, Navigation, Phone, Search, Settings, Tag, User, Video, Watch, Wifi } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

const AVAILABLE_ICONS: Record<string, any> = {
  Scissors, Sparkles, Droplet, Wind, Zap, Star, Heart, Smile, Crown, Flower, Moon, Sun, Cloud, Flame, Gem, CircleDot, Activity, Coffee, Monitor, Music, Shield, Anchor, Award, Briefcase, Camera, Compass, Eye, Gift, Globe, Key, Map, MessageCircle, Navigation, Phone, Search, Settings, Tag, User, Video, Watch, Wifi
};

export default function ServicesPage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { can } = usePermissions();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', service_category_id: '', icon: '', is_active: true });

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.get('/services').then(res => setData(res.data)).catch(() => toast.error('Failed to load data')),
      api.get('/service-categories').then(res => setCategories(res.data)).catch(err => console.error(err))
    ]).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, formData);
        toast.success('Updated successfully!');
      } else {
        await api.post('/services', formData);
        toast.success('Added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this?')) {
      try {
        await api.delete(`/services/${id}`);
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
        name: item.name || '', 
        price: item.price || '', 
        service_category_id: item.service_category_id || '',
        icon: item.icon || '',
        is_active: item.is_active ?? true
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', service_category_id: '', icon: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Scissors className="text-[var(--color-gold)] w-6 h-6 md:w-8 md:h-8" /> Services</h1>
        {can('services', 'add') && (
          <button onClick={() => openModal()} className="w-full sm:w-auto justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base"><Plus size={20} /> Add New</button>
        )}
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left whitespace-nowrap min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-gray-400">
              <th className="pb-3">Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Price (₨)</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="hover:bg-[var(--color-background)] transition-colors">
                  <td className="py-3 sm:py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white/10 animate-pulse rounded-full"></div>
                      <div className="h-4 w-32 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 pr-4"><div className="h-4 w-24 bg-white/5 animate-pulse rounded"></div></td>
                  <td className="py-3 sm:py-4 pr-4"><div className="h-4 w-16 bg-white/10 animate-pulse rounded"></div></td>
                  <td className="py-3 sm:py-4 pr-4"><div className="h-5 w-16 bg-white/5 animate-pulse rounded"></div></td>
                  <td className="py-3 sm:py-4 flex gap-2 sm:gap-3">
                    <div className="w-5 h-5 bg-white/5 animate-pulse rounded"></div>
                    <div className="w-5 h-5 bg-white/5 animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : data.map((item: any) => (
              <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="py-3 sm:py-4 pr-4">
                  <div className="flex items-center gap-2">
                    {item.icon && AVAILABLE_ICONS[item.icon] ? React.createElement(AVAILABLE_ICONS[item.icon], { size: 16, className: 'text-[var(--color-gold)]' }) : null}
                    {item.name}
                  </div>
                </td>
                <td className="py-3 sm:py-4 pr-4 text-gray-400">
                  {item.category ? (item.category.parent ? `${item.category.parent.name} - ${item.category.name}` : item.category.name) : '--'}
                </td>
                <td className="py-3 sm:py-4 pr-4 text-[var(--color-gold)] font-bold">₨ {item.price}</td>
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
            {data.length === 0 && !isLoading && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[var(--color-border)] shrink-0">
              <h2 className="text-lg sm:text-xl font-bold truncate pr-2">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)] shrink-0"><X size={20} className="sm:w-6 sm:h-6" /></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto grow custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">price</label>
                  <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1 capitalize">service category</label>
                  <select required value={formData.service_category_id} onChange={e => setFormData({...formData, service_category_id: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none appearance-none">
                    <option value="" disabled>Select a category...</option>
                    {categories.map((c: any) => (
                      <React.Fragment key={c.id}>
                        <option value={c.id}>{c.name}</option>
                        {c.children && c.children.map((sub: any) => (
                          <option key={sub.id} value={sub.id}>&nbsp;&nbsp;&nbsp;&nbsp;↳ {sub.name}</option>
                        ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-2 capitalize">service icon (optional)</label>
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                    {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                      const IconComponent = AVAILABLE_ICONS[iconName];
                      const isSelected = formData.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          title={iconName}
                          onClick={() => setFormData({ ...formData, icon: isSelected ? '' : iconName })}
                          className={`p-2 rounded flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--color-gold)] text-black scale-110 shadow-lg' : 'text-gray-400 hover:text-[var(--color-foreground)] hover:bg-[var(--color-panel)]'}`}
                        >
                          <IconComponent size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[var(--color-background)] border border-[var(--color-border)] p-3 sm:p-4 rounded-lg mt-2">
                  <div>
                    <div className="text-sm font-bold text-[var(--color-foreground)]">Active Status</div>
                    <div className="text-xs text-gray-400">Can this service be billed right now?</div>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                    className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full cursor-pointer relative transition-colors shrink-0 ${formData.is_active ? 'bg-[var(--color-gold)]' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black transition-all ${formData.is_active ? 'left-7 sm:left-8' : 'left-1'}`}></div>
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-2.5 sm:py-3 rounded-lg font-bold mt-4 sm:mt-6 hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base">
                  {editingId ? 'Save Changes' : 'Create Service'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
