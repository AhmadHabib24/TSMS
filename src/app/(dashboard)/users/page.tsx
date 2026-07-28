'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role_id: '' });
  const { can, user } = usePermissions();

  const fetchData = () => {
    api.get('/users').then(res => setData(res.data)).catch(() => toast.error('Failed to load users'));
    api.get('/roles').then(res => setRoles(res.data)).catch(() => toast.error('Failed to load roles'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, formData);
        toast.success('Updated successfully!');
      } else {
        await api.post('/users', formData);
        toast.success('Added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed. Email might already exist.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Cannot delete this user');
      }
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ name: item.name, email: item.email, password: '', role_id: item.role_id });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', password: '', role_id: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3"><ShieldAlert className="text-[var(--color-gold)] shrink-0" size={32} /> <span className="truncate">System Users</span></h1>
        {can('users', 'add') && (
          <button onClick={() => openModal()} className="w-full sm:w-auto justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors"><Plus size={20} /> Add New User</button>
        )}
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap [&_td]:pr-4 [&_th]:pr-4">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="py-4 font-bold">{item.name} {item.id === user?.id && <span className="ml-2 text-xs bg-[var(--color-gold)]/20 text-[var(--color-gold)] px-2 py-1 rounded-full">You</span>}</td>
                <td className="py-4 text-gray-300">{item.email}</td>
                <td className="py-4 text-[var(--color-gold)]">{item.role?.name || 'No Role'}</td>
                <td className="py-4 flex gap-3">
                  {can('users', 'edit') && (
                    <button onClick={() => openModal(item)} className="text-gray-400 hover:text-[var(--color-foreground)] transition-colors"><Edit size={18}/></button>
                  )}
                  {can('users', 'delete') && item.id !== user?.id && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)]"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none" />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Password {editingId && <span className="text-xs text-gray-500">(Leave blank to keep current)</span>}</label>
                <input required={!editingId} minLength={8} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" placeholder={editingId ? '••••••••' : ''} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Assign Role</label>
                <select required value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none">
                  <option value="" disabled>Select a role...</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-3 rounded-lg font-bold mt-6 hover:bg-[var(--color-gold-hover)] transition-colors">
                {editingId ? 'Save Changes' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
