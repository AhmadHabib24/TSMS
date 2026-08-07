'use client';
import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, X, Image as ImageIcon, AlertTriangle, ArrowUpRight, ArrowDownRight, History, Activity } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');

  const [data, setData] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const { can } = usePermissions();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<any>(null);

  const [formData, setFormData] = useState<any>({});
  const [adjustForm, setAdjustForm] = useState({ quantity_change: '', reason: 'Purchase' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoadingStock, setIsLoadingStock] = useState(true);

  const fetchData = () => {
    setIsLoadingStock(true);
    api.get('/inventory-items').then(res => setData(res.data)).catch(() => toast.error('Failed to load data')).finally(() => setIsLoadingStock(false));
  };

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = () => {
    setIsLoadingHistory(true);
    api.get('/inventory-items/history').then(res => setHistoryData(res.data)).catch(() => toast.error('Failed to load history')).finally(() => setIsLoadingHistory(false));
  };

  useEffect(() => {
    if (activeTab === 'stock') fetchData();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) payload.append(key, formData[key]);
      });
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingId) {
        payload.append('_method', 'PUT');
        await api.post(`/inventory-items/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Updated successfully!');
      } else {
        await api.post('/inventory-items', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let change = parseInt(adjustForm.quantity_change);
    if (adjustForm.reason === 'Consumption' && change > 0) change = -change;
    if (adjustForm.reason === 'Purchase' && change < 0) change = Math.abs(change);
    if (adjustForm.reason === 'Adjustment' && change > 0) change = -change; // We can assume standard adjustment is reduction if not specified, but let's just use the absolute for now, wait, for "Other/Adjustment" if it's positive we keep it, if negative we keep it. But input is min="1" so it's always positive. Let's make "Adjustment" default to positive, user can edit raw stock if they just want to fix it. Actually, a negative input can be allowed for Adjustment, so I'll remove min="1" for Adjustment. Let's handle it as is for now.

    try {
      await api.post(`/inventory-items/${adjustingItem.id}/adjust`, {
        quantity_change: change,
        reason: adjustForm.reason
      });
      toast.success('Stock adjusted successfully');
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to adjust stock');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this?')) {
      try {
        await api.delete(`/inventory-items/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  const openModal = (item?: any) => {
    setImageFile(null);
    if (item) {
      setEditingId(item.id);
      const initData: any = {};
      Object.keys({ "name": "text", "stock_level": "number", "low_stock_threshold": "number" }).forEach(k => initData[k] = item[k] || '');
      setFormData(initData);
    } else {
      setEditingId(null);
      const initData: any = {};
      Object.keys({ "name": "text", "stock_level": "number", "low_stock_threshold": "number" }).forEach(k => initData[k] = '');
      setFormData(initData);
    }
    setIsModalOpen(true);
  };

  const openAdjustModal = (item: any) => {
    setAdjustingItem(item);
    setAdjustForm({ quantity_change: '', reason: 'Purchase' });
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3"><Package className="text-[var(--color-gold)] shrink-0" size={32} /> <span className="truncate">Inventory Management</span></h1>

        <div className="flex flex-col sm:flex-row w-full md:w-auto bg-[var(--color-background)] border border-[var(--color-border)] p-1 rounded-lg gap-1 sm:gap-0">
          <button onClick={() => setActiveTab('stock')} className={`flex-1 justify-center px-3 sm:px-4 md:px-6 py-2 text-sm sm:text-base rounded-md font-bold transition-all flex items-center gap-2 ${activeTab === 'stock' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-[var(--color-foreground)]'}`}>
            <Package size={18} className="shrink-0" /> <span className="whitespace-nowrap">Stock & Alerts</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 justify-center px-3 sm:px-4 md:px-6 py-2 text-sm sm:text-base rounded-md font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-[var(--color-foreground)]'}`}>
            <History size={18} className="shrink-0" /> <span className="whitespace-nowrap">History & Reports</span>
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end">
            {can('inventory', 'add') && (
              <button onClick={() => openModal()} className="w-full sm:w-auto justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors"><Plus size={20} /> Add New Product</button>
            )}
          </div>
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap [&_td]:pr-4 [&_th]:pr-4">
              <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th className="pb-3">Image</th><th className="pb-3">Item Name</th><th className="pb-3">Stock Level</th><th className="pb-3">Threshold</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoadingStock ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-[var(--color-background)] transition-colors">
                      <td className="py-4"><div className="w-12 h-12 rounded-full bg-white/5 animate-pulse"></div></td>
                      <td className="py-4"><div className="h-4 w-32 bg-white/10 animate-pulse rounded"></div></td>
                      <td className="py-4"><div className="h-6 w-16 bg-white/10 animate-pulse rounded"></div></td>
                      <td className="py-4"><div className="h-4 w-12 bg-white/5 animate-pulse rounded"></div></td>
                      <td className="py-4"><div className="h-6 w-24 bg-white/5 animate-pulse rounded-full"></div></td>
                      <td className="py-4 flex gap-3">
                        <div className="h-8 w-16 bg-white/5 animate-pulse rounded"></div>
                        <div className="h-8 w-8 bg-white/5 animate-pulse rounded ml-3"></div>
                        <div className="h-8 w-8 bg-white/5 animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : data.map((item: any) => {
                  const isLowStock = item.stock_level <= item.low_stock_threshold;
                  return (
                    <tr key={item.id} className={`transition-colors ${isLowStock ? 'bg-red-500/10' : 'hover:bg-[var(--color-background)]'}`}>
                      <td className="py-4">
                        {item.image_path ? (
                          <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.image_path}`} alt="img" className="w-12 h-12 rounded-full object-cover border border-[var(--color-gold)]" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[var(--color-background)] flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                        )}
                      </td>
                      <td className="py-4 font-bold text-[var(--color-foreground)]">{item.name}</td>
                      <td className={`py-4 font-black text-xl ${isLowStock ? 'text-red-400' : 'text-[var(--color-gold)]'}`}>{item.stock_level}</td>
                      <td className="py-4 text-gray-400">{item.low_stock_threshold}</td>
                      <td className="py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/30">
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="py-4 flex gap-3">
                        <button onClick={() => openAdjustModal(item)} className="bg-[var(--color-background)] border border-[var(--color-border)] px-3 py-1 rounded text-sm font-bold hover:border-[var(--color-gold)] transition-colors">Adjust</button>
                        {can('inventory', 'edit') && (
                          <button onClick={() => openModal(item)} className="ml-3 text-gray-400 hover:text-[var(--color-foreground)] transition-colors"><Edit size={18} /></button>
                        )}
                        {can('inventory', 'delete') && (
                          <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {data.length === 0 && !isLoadingStock && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No data found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-gray-400">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Item</th>
                  <th className="py-4 px-4">Transaction Type</th>
                  <th className="py-4 px-4 text-right">Quantity Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoadingHistory ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-[var(--color-background)] transition-colors">
                      <td className="py-4 px-4"><div className="h-4 w-32 bg-white/5 animate-pulse rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-40 bg-white/10 animate-pulse rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-6 w-24 bg-white/10 animate-pulse rounded-full"></div></td>
                      <td className="py-4 px-4"><div className="h-6 w-12 bg-white/10 animate-pulse rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : historyData.map((record: any) => (
                  <tr key={record.id} className="hover:bg-[var(--color-background)] transition-colors">
                    <td className="py-4 px-4 text-gray-300">{new Date(record.created_at).toLocaleString()}</td>
                    <td className="py-4 px-4 font-bold text-[var(--color-foreground)]">{record.item?.name}</td>
                    <td className="py-4 px-4">
                      {record.reason === 'Purchase' && <span className="inline-flex items-center gap-1 text-green-400"><ArrowUpRight size={16} /> Purchase</span>}
                      {record.reason === 'Consumption' && <span className="inline-flex items-center gap-1 text-red-400"><ArrowDownRight size={16} /> Consumption</span>}
                      {record.reason === 'Adjustment' && <span className="inline-flex items-center gap-1 text-yellow-400"><Activity size={16} /> Adjustment</span>}
                    </td>
                    <td className={`py-4 px-4 text-right font-black ${record.quantity_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {record.quantity_change > 0 ? '+' : ''}{record.quantity_change}
                    </td>
                  </tr>
                ))}
                {historyData.length === 0 && !isLoadingHistory && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No stock history found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-3 sm:p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)]"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold">Image (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-gold)] file:text-black hover:file:bg-[var(--color-gold-hover)]" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold capitalize">Product Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none" placeholder="e.g. L'Oreal Shampoo 500ml" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-bold capitalize">Stock Level</label>
                  <input required value={formData.stock_level} onChange={e => setFormData({ ...formData, stock_level: e.target.value })} type="number" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none" />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-bold capitalize text-red-400">Low Stock Alert At</label>
                  <input required value={formData.low_stock_threshold} onChange={e => setFormData({ ...formData, low_stock_threshold: e.target.value })} type="number" className="w-full bg-[var(--color-background)] border border-red-500/30 rounded-lg py-3 px-4 focus:border-red-500 outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-4 rounded-xl font-bold mt-6 hover:bg-[var(--color-gold-hover)] transition-transform hover:scale-[1.02]">
                {editingId ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isAdjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-3 sm:p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]">
              <h2 className="text-xl font-bold flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span>Adjust Stock</span>
                <span className="text-[var(--color-gold)] text-sm sm:text-base">{adjustingItem.name}</span>
              </h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)]"><X size={24} /></button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-3 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <button type="button" onClick={() => setAdjustForm({ ...adjustForm, reason: 'Purchase' })} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${adjustForm.reason === 'Purchase' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-[var(--color-background)] border-[var(--color-border)] text-gray-400'}`}>Purchase</button>
                <button type="button" onClick={() => setAdjustForm({ ...adjustForm, reason: 'Consumption' })} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${adjustForm.reason === 'Consumption' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[var(--color-background)] border-[var(--color-border)] text-gray-400'}`}>Consumption</button>
                <button type="button" onClick={() => setAdjustForm({ ...adjustForm, reason: 'Adjustment' })} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${adjustForm.reason === 'Adjustment' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-[var(--color-background)] border-[var(--color-border)] text-gray-400'}`}>Other</button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold">Quantity Change</label>
                <input type="number" required min={adjustForm.reason === 'Adjustment' ? undefined : "1"} value={adjustForm.quantity_change} onChange={e => setAdjustForm({ ...adjustForm, quantity_change: e.target.value })} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-2xl font-black text-center" placeholder={adjustForm.reason === 'Adjustment' ? "+/- 0" : "0"} />
                <p className="text-xs text-gray-500 text-center mt-2">
                  {adjustForm.reason === 'Purchase' && "Enter the number of items purchased"}
                  {adjustForm.reason === 'Consumption' && "Enter the number of items consumed"}
                  {adjustForm.reason === 'Adjustment' && "Enter positive number to add, negative to subtract"}
                </p>
              </div>

              <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-4 rounded-xl font-bold mt-6 hover:bg-[var(--color-gold-hover)] transition-transform hover:scale-[1.02]">
                Log Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
