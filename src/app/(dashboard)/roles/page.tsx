'use client';
import { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

const MODULES = ['dashboard', 'billing', 'customers', 'services', 'service_categories', 'employees', 'inventory', 'reports', 'roles', 'users', 'finance', 'settings', 'expense_categories', 'salaries'];
const ACTIONS = ['view', 'add', 'edit', 'delete'];

export default function RolesPage() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', permissions: {} as any });
  const { can } = usePermissions();

  const fetchData = () => {
    api.get('/roles').then(res => setData(res.data)).catch(() => toast.error('Failed to load data'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/roles/${editingId}`, formData);
        toast.success('Updated successfully!');
      } else {
        await api.post('/roles', formData);
        toast.success('Added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Operation failed. Role might already exist.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await api.delete(`/roles/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Cannot delete this role');
      }
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ name: item.name || '', permissions: item.permissions || {} });
    } else {
      setEditingId(null);
      setFormData({ name: '', permissions: {} });
    }
    setIsModalOpen(true);
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setFormData(prev => {
      const perms = { ...prev.permissions };
      if (!perms[module]) perms[module] = [];
      if (checked) {
        if (!perms[module].includes(action)) perms[module].push(action);
      } else {
        perms[module] = perms[module].filter((a: string) => a !== action);
      }
      return { ...prev, permissions: perms };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3"><Settings className="text-[var(--color-gold)] shrink-0" size={32} /> <span className="truncate">Roles</span></h1>
        {can('roles', 'add') && (
          <button onClick={() => openModal()} className="w-full sm:w-auto justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors"><Plus size={20} /> Add New</button>
        )}
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap [&_td]:pr-4 [&_th]:pr-4">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th className="pb-3">Role Name</th><th className="pb-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="py-4 font-bold text-[var(--color-gold)]">{item.name}</td>
                <td className="py-4 flex gap-3">
                  {can('roles', 'edit') && (
                    <button onClick={() => openModal(item)} className="text-gray-400 hover:text-[var(--color-foreground)] transition-colors"><Edit size={18}/></button>
                  )}
                  {can('roles', 'delete') && item.name !== 'Admin' && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={2} className="py-8 text-center text-gray-500">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Role' : 'Add New Role'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)]"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role Name</label>
                <input required value={formData.name} disabled={formData.name === 'Admin'} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none disabled:opacity-50" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Permissions Matrix</h3>
                <div className="grid grid-cols-1 gap-4">
                  {MODULES.map(module => (
                    <div key={module} className="bg-[var(--color-background)] p-3 sm:p-4 rounded-lg border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <span className="font-bold capitalize w-full sm:w-32">{module.replace('_', ' ')}</span>
                      <div className="flex flex-wrap gap-4 sm:gap-6">
                        {ACTIONS.map(action => {
                          const isChecked = formData.permissions[module]?.includes(action) || false;
                          const disabled = formData.name === 'Admin';
                          return (
                            <label key={action} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                disabled={disabled}
                                checked={disabled ? true : isChecked} 
                                onChange={e => handlePermissionChange(module, action, e.target.checked)}
                                className="accent-[var(--color-gold)] w-4 h-4" 
                              />
                              <span className="capitalize text-sm">{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-3 rounded-lg font-bold mt-6 hover:bg-[var(--color-gold-hover)] transition-colors">
                {editingId ? 'Save Changes' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
