'use client';
import { useState, useEffect } from 'react';
import { Scissors, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function ServicesPage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { can } = usePermissions();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', duration_minutes: '', service_category_id: '', is_active: true });

  const fetchData = () => {
    api.get('/services').then(res => setData(res.data)).catch(() => toast.error('Failed to load data'));
    api.get('/service-categories').then(res => setCategories(res.data)).catch(err => console.error(err));
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
        duration_minutes: item.duration_minutes || '', 
        service_category_id: item.service_category_id || '',
        is_active: item.is_active ?? true
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', duration_minutes: '', service_category_id: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Scissors className="text-[var(--color-gold)]" size={32} /> Services</h1>
        {can('services', 'add') && (
          <button onClick={() => openModal()} className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors"><Plus size={20} /> Add New</button>
        )}
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-gray-400">
              <th>Name</th>
              <th>Category</th>
              <th>Price (₨)</th>
              <th>Duration (min)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="py-4">{item.name}</td>
                <td className="py-4 text-gray-400">{item.category?.name || '--'}</td>
                <td className="py-4 text-[var(--color-gold)] font-bold">₨ {item.price}</td>
                <td className="py-4">{item.duration_minutes}</td>
                <td className="py-4">
                  {item.is_active ? 
                    <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Active</span> : 
                    <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Inactive</span>
                  }
                </td>
                <td className="py-4 flex gap-3">
                  {can('services', 'edit') && (
                    <button onClick={() => openModal(item)} className="mr-3 text-gray-400 hover:text-white transition-colors"><Edit size={18}/></button>
                  )}
                  {can('services', 'delete') && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm text-gray-400 mb-1 capitalize">name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 capitalize">price</label>
                  <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1 capitalize">duration (minutes)</label>
                  <input required value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} type="number" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1 capitalize">service category</label>
                <select required value={formData.service_category_id} onChange={e => setFormData({...formData, service_category_id: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none appearance-none">
                  <option value="" disabled>Select a category...</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center bg-[var(--color-background)] border border-[var(--color-border)] p-4 rounded-lg mt-2">
                <div>
                  <div className="text-sm font-bold text-white">Active Status</div>
                  <div className="text-xs text-gray-400">Can this service be billed right now?</div>
                </div>
                <div 
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                  className={`w-14 h-7 rounded-full cursor-pointer relative transition-colors ${formData.is_active ? 'bg-[var(--color-gold)]' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-black transition-all ${formData.is_active ? 'left-8' : 'left-1'}`}></div>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-3 rounded-lg font-bold mt-6 hover:bg-[var(--color-gold-hover)] transition-colors">
                {editingId ? 'Save Changes' : 'Create Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
