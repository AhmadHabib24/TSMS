'use client';
import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, X, TrendingDown, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<any>({});

  const [expenseCategories, setExpenseCategories] = useState([]);
  const INCOME_SOURCES = ['Daily Closing', 'Investment', 'Other'];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'expenses' ? '/expenses' : '/income-records';
      const res = await api.get(endpoint);
      setData(res.data);
      
      const catsRes = await api.get('/expense-categories');
      setExpenseCategories(catsRes.data);
    } catch (e) {
      toast.error('Failed to load data');
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'expenses' ? '/expenses' : '/income-records';
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, formData);
        toast.success('Updated successfully');
      } else {
        await api.post(endpoint, formData);
        toast.success('Added successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        const endpoint = activeTab === 'expenses' ? '/expenses' : '/income-records';
        await api.delete(`${endpoint}/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      if (activeTab === 'expenses') {
        setFormData({ category: item.category, amount: item.amount, expense_date: item.expense_date, description: item.description || '' });
      } else {
        setFormData({ source: item.source, amount: item.amount, income_date: item.income_date });
      }
    } else {
      setEditingId(null);
      if (activeTab === 'expenses') {
        setFormData({ category: 'Rent', amount: '', expense_date: new Date().toISOString().split('T')[0], description: '' });
      } else {
        setFormData({ source: 'Other', amount: '', income_date: new Date().toISOString().split('T')[0] });
      }
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3"><DollarSign className="text-[var(--color-gold)] shrink-0" size={32} /> <span className="truncate">Finance Module</span></h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto bg-[var(--color-background)] border border-[var(--color-border)] p-1 rounded-lg gap-1 sm:gap-0">
          <button 
            onClick={() => setActiveTab('expenses')} 
            className={`flex-1 flex justify-center px-3 sm:px-6 py-2 rounded-md text-sm sm:text-base font-bold transition-all whitespace-nowrap ${activeTab === 'expenses' ? 'bg-red-500 text-[var(--color-foreground)] shadow-md' : 'text-gray-400 hover:text-[var(--color-foreground)]'}`}
          >
            Expenses
          </button>
          <button 
            onClick={() => setActiveTab('income')} 
            className={`flex-1 flex justify-center px-3 sm:px-6 py-2 rounded-md text-sm sm:text-base font-bold transition-all whitespace-nowrap ${activeTab === 'income' ? 'bg-green-500 text-[var(--color-foreground)] shadow-md' : 'text-gray-400 hover:text-[var(--color-foreground)]'}`}
          >
            Manual Income
          </button>
        </div>
        
        <button onClick={() => openModal()} className="w-full sm:w-auto justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors">
          <Plus size={20} /> Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
        </button>
      </div>

      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap [&_td]:pr-4 [&_th]:pr-4">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-gray-400 text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Date</th>
                <th className="py-4 px-6 font-bold">{activeTab === 'expenses' ? 'Category' : 'Source'}</th>
                {activeTab === 'expenses' && <th className="py-4 px-6 font-bold">Description</th>}
                <th className="py-4 px-6 font-bold">Amount</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                  <td className="py-4 px-6 text-gray-300">{item.expense_date || item.income_date}</td>
                  <td className="py-4 px-6 font-bold text-[var(--color-foreground)] flex items-center gap-2">
                    {activeTab === 'expenses' ? <TrendingDown size={16} className="text-red-500"/> : <TrendingUp size={16} className="text-green-500"/>}
                    {item.category || item.source}
                  </td>
                  {activeTab === 'expenses' && <td className="py-4 px-6 text-gray-400 text-sm max-w-xs truncate">{item.description || '--'}</td>}
                  <td className={`py-4 px-6 font-bold ${activeTab === 'expenses' ? 'text-red-400' : 'text-green-400'}`}>₨ {item.amount}</td>
                  <td className="py-4 px-6 flex justify-end gap-2">
                    <button onClick={() => openModal(item)} className="p-2 bg-black/50 text-[var(--color-foreground)] rounded hover:bg-[var(--color-gold)] hover:text-black transition-colors"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-black/50 text-[var(--color-foreground)] rounded hover:bg-red-500 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-500">No records found.</td></tr>}
            </tbody>
          </table>
</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {activeTab === 'expenses' ? <TrendingDown className="text-red-500"/> : <TrendingUp className="text-green-500"/>}
                {editingId ? 'Edit Record' : 'Add New Record'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)]"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Date</label>
                <input required type="date" value={formData.expense_date || formData.income_date || ''} onChange={e => activeTab === 'expenses' ? setFormData({...formData, expense_date: e.target.value}) : setFormData({...formData, income_date: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-[var(--color-foreground)]" />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">{activeTab === 'expenses' ? 'Category' : 'Source'}</label>
                <select required value={formData.category || formData.source || ''} onChange={e => activeTab === 'expenses' ? setFormData({...formData, category: e.target.value}) : setFormData({...formData, source: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-[var(--color-foreground)]">
                  <option value="">Select {activeTab === 'expenses' ? 'Category' : 'Source'}</option>
                  {activeTab === 'expenses' 
                    ? expenseCategories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>) 
                    : INCOME_SOURCES.map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Amount (₨)</label>
                <input required type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none" placeholder="0" />
              </div>

              {activeTab === 'expenses' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none resize-none h-24" placeholder="Optional details..."></textarea>
                </div>
              )}

              <button type="submit" className={`w-full py-3 rounded-lg font-bold text-[var(--color-foreground)] transition-colors ${activeTab === 'expenses' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                {editingId ? 'Save Changes' : 'Add Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
