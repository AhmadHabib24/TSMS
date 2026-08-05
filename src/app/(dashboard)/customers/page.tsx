'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, X, Image as ImageIcon, Search, Eye, Star, Clock } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function CustomersPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'history'
  
  const { can } = usePermissions();
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Profile data fetched from backend (includes bills and favorites)
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fetchData = () => {
    api.get('/customers').then(res => setData(res.data)).catch(() => toast.error('Failed to load data'));
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.mobile && String(c.mobile).includes(search))
  );

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
        await api.post(`/customers/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Updated successfully!');
      } else {
        await api.post('/customers', payload, {
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

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  const openModal = async (item?: any, tab = 'profile') => {
    setImageFile(null);
    setActiveTab(tab);
    setCustomerProfile(null);
    
    if (item) {
      setEditingId(item.id);
      setFormData({ name: item.name || '', mobile: item.mobile || '' });
      setIsModalOpen(true);
      
      // Fetch deep profile
      setIsLoadingProfile(true);
      try {
        const res = await api.get(`/customers/${item.id}`);
        setCustomerProfile(res.data);
      } catch (err) {
        toast.error('Failed to fetch full history');
      } finally {
        setIsLoadingProfile(false);
      }
    } else {
      setEditingId(null);
      setFormData({ name: '', mobile: '' });
      setIsModalOpen(true);
    }
  };

  const [selectedBillForPayment, setSelectedBillForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    try {
      await api.put(`/bills/${selectedBillForPayment.id}/mark-paid`, {
        amount: Number(paymentAmount),
        payment_method: paymentMethod
      });
      toast.success('Payment recorded successfully!');
      setSelectedBillForPayment(null);
      setPaymentAmount('');
      if (editingId) {
        const res = await api.get(`/customers/${editingId}`);
        setCustomerProfile(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Users className="text-[var(--color-gold)] w-6 h-6 md:w-8 md:h-8" /> Customers</h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text" 
              placeholder="Search by name or mobile..." 
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 pl-10 px-4 focus:border-[var(--color-gold)] outline-none text-sm sm:text-base" 
            />
          </div>
          {can('customers', 'add') && (
            <button onClick={() => openModal(null, 'profile')} className="shrink-0 w-full sm:w-auto justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base">
              <Plus size={20} /> Add New
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left whitespace-nowrap min-w-[500px]">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th className="pb-3">Image</th><th className="pb-3">Name</th><th className="pb-3">Mobile</th><th className="pb-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filteredData.map((item: any) => (
              <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="py-3 sm:py-4 pr-4">
                  {item.image_path ? (
                    <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.image_path}`} alt="img" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[var(--color-gold)]" />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--color-border)] flex items-center justify-center text-gray-400"><ImageIcon size={18} className="sm:w-5 sm:h-5"/></div>
                  )}
                </td>
                <td className="py-3 sm:py-4 pr-4 font-bold">{item.name}</td>
                <td className="py-3 sm:py-4 pr-4 text-gray-400">{item.mobile}</td>
                <td className="py-3 sm:py-4 flex flex-wrap gap-2 sm:gap-3 items-center min-w-[150px]">
                  <button onClick={() => openModal(item, 'history')} className="text-gray-400 hover:text-[var(--color-gold)] transition-colors flex items-center gap-1 text-xs sm:text-sm bg-black/20 px-2 sm:px-3 py-1 rounded-full border border-[var(--color-border)]"><Eye size={14} className="sm:w-4 sm:h-4"/> Profile</button>
                  {can('customers', 'edit') && (
                    <button onClick={() => openModal(item, 'profile')} className="text-gray-400 hover:text-[var(--color-foreground)] transition-colors p-1"><Edit size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                  )}
                  {can('customers', 'delete') && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors p-1"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                  )}
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No customers found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            
            <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)] shrink-0 gap-2">
              <h2 className="text-lg sm:text-2xl font-bold truncate pr-2">{editingId ? (customerProfile?.customer?.name || formData.name) : 'Add New Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)] shrink-0"><X size={20} className="sm:w-6 sm:h-6" /></button>
            </div>

            {editingId && (
              <div className="flex border-b border-[var(--color-border)] px-2 sm:px-6 shrink-0 bg-[var(--color-background)] overflow-x-auto custom-scrollbar">
                <button onClick={() => setActiveTab('profile')} className={`py-3 sm:py-4 px-4 sm:px-6 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'profile' ? 'border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Edit Details</button>
                <button onClick={() => setActiveTab('history')} className={`py-3 sm:py-4 px-4 sm:px-6 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'history' ? 'border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>History & Favorites</button>
                <button onClick={() => setActiveTab('udhar')} className={`py-3 sm:py-4 px-4 sm:px-6 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'udhar' ? 'border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Udhar (Pending)</button>
              </div>
            )}

            <div className="p-4 sm:p-6 overflow-y-auto grow custom-scrollbar">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1">Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-[var(--color-gold)] file:text-black hover:file:bg-[var(--color-gold-hover)]" />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1">Full Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 focus:border-[var(--color-gold)] outline-none text-sm sm:text-base" />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-1">Mobile Number</label>
                    <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 focus:border-[var(--color-gold)] outline-none text-sm sm:text-base" />
                  </div>
                  
                  <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-2.5 sm:py-3 rounded-lg font-bold mt-2 sm:mt-4 hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base">
                    {editingId ? 'Save Changes' : 'Create Customer'}
                  </button>
                </form>
              )}

              {activeTab === 'history' && (
                <div>
                  {isLoadingProfile ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div></div>
                  ) : customerProfile ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      
                      {/* Stats Section */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                        <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1">Total Visits</div>
                          <div className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">{customerProfile.customer?.visit_count || 0}</div>
                        </div>
                        <div className="bg-[var(--color-background)] border border-[var(--color-border)] p-3 sm:p-4 rounded-xl text-center">
                          <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1">Total Spend</div>
                          <div className="text-xl sm:text-2xl font-bold text-[var(--color-gold)]">₨ {Number(customerProfile.customer?.total_spend || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-[var(--color-background)] border border-orange-500/30 p-3 sm:p-4 rounded-xl text-center shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                          <div className="text-orange-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1">Pending Udhar</div>
                          <div className="text-xl sm:text-2xl font-bold text-orange-500">
                            ₨ {customerProfile.customer?.bills?.filter((b: any) => b.payment_status === 'pending').reduce((sum: number, b: any) => sum + (Number(b.total) - (b.payments?.reduce((s:number, p:any) => s + Number(p.amount), 0) || 0)), 0).toLocaleString() || 0}
                          </div>
                        </div>
                        <div className="col-span-2 bg-[var(--color-background)] border border-[var(--color-border)] p-3 sm:p-4 rounded-xl text-center flex flex-col justify-center">
                          <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1">Last Visit</div>
                          <div className="text-sm sm:text-md font-bold text-[var(--color-foreground)] mt-1">
                            {customerProfile.customer?.bills?.length > 0 
                              ? new Date(customerProfile.customer.bills[0].created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) 
                              : 'No visits yet'}
                          </div>
                        </div>
                      </div>

                      {/* Favorites Section */}
                      <div className="mt-6">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3 sm:mb-4"><Star size={16} className="text-[var(--color-gold)] w-4 h-4"/> Favorite Services</h3>
                        {customerProfile.favorites?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {customerProfile.favorites.map((fav: any) => (
                              <div key={fav.service.id} className="bg-[var(--color-background)] border border-[var(--color-border)] p-3 sm:p-4 rounded-xl text-center">
                                <div className="font-bold text-[var(--color-foreground)] mb-1 text-sm sm:text-base truncate">{fav.service.name}</div>
                                <div className="text-xs text-[var(--color-gold)]">{fav.count} {fav.count === 1 ? 'visit' : 'visits'}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic text-sm">No services recorded yet.</div>
                        )}
                      </div>

                      {/* History Section */}
                      <div className="mt-6">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3 sm:mb-4"><Clock size={16} className="w-4 h-4"/> Past Bills</h3>
                        <div className="space-y-3 sm:space-y-4">
                          {customerProfile.customer?.bills?.length > 0 ? (
                            customerProfile.customer.bills.map((bill: any) => (
                              <div key={bill.id} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-[var(--color-gold)] transition-colors">
                                <div className="flex justify-between sm:block items-start sm:items-stretch">
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">{new Date(bill.created_at).toLocaleString()}</div>
                                    <div className="font-medium text-sm">Served by: <span className="text-[var(--color-foreground)]">{bill.employee?.name || 'Unknown'}</span></div>
                                  </div>
                                  <div className="font-bold text-[var(--color-gold)] whitespace-nowrap sm:hidden">
                                    ₨ {bill.total}
                                  </div>
                                </div>
                                <div className="flex-1 bg-black/20 p-2 rounded-lg text-xs sm:text-sm border border-[var(--color-border)] break-words">
                                  {bill.items?.map((i: any) => i.service?.name).join(', ') || 'No items'}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className="font-bold text-[var(--color-gold)] whitespace-nowrap hidden sm:block">
                                    ₨ {bill.total}
                                  </div>
                                  {bill.payment_status === 'pending' ? (
                                    <button onClick={() => { setSelectedBillForPayment(bill); setPaymentAmount(String(bill.total - (bill.payments?.reduce((s:number,p:any)=>s+Number(p.amount),0)||0))); }} className="bg-orange-500 text-black px-3 py-1 text-xs font-bold rounded hover:bg-orange-600 transition-colors">Pay Installment</button>
                                  ) : (
                                    <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">Paid</span>
                                  )}
                                </div>
                                {bill.payments && bill.payments.length > 0 && (
                                  <div className="w-full mt-2 pt-2 border-t border-[var(--color-border)] text-xs text-gray-400 col-span-full">
                                    <div className="font-bold mb-1">Installments Paid:</div>
                                    {bill.payments.map((p: any) => (
                                      <div key={p.id} className="flex justify-between">
                                        <span>{new Date(p.created_at).toLocaleDateString()} - {p.payment_method}</span>
                                        <span className="text-green-400">₨ {p.amount}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between font-bold mt-1 pt-1 border-t border-[var(--color-border)] text-[var(--color-foreground)]">
                                      <span>Remaining:</span>
                                      <span className="text-orange-400">₨ {bill.total - bill.payments.reduce((s:number, p:any) => s + Number(p.amount), 0)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 italic text-sm">No billing history found.</div>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center text-red-500">Error loading profile data.</div>
                  )}
                </div>
              )}

              {activeTab === 'udhar' && (
                <div>
                  {isLoadingProfile ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : customerProfile ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3 sm:mb-4"><Clock size={16} className="w-4 h-4 text-orange-500"/> Udhar Bills (Pending & Paid)</h3>
                      {customerProfile.customer?.bills?.filter((b: any) => b.payment_method === 'udhar').length > 0 ? (
                        customerProfile.customer.bills.filter((b: any) => b.payment_method === 'udhar').map((bill: any) => (
                          <div key={bill.id} className={`bg-[var(--color-background)] border ${bill.payment_status === 'pending' ? 'border-orange-500/50' : 'border-[var(--color-border)]'} rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-orange-500 transition-colors`}>
                            <div className="flex justify-between sm:block items-start sm:items-stretch">
                              <div>
                                <div className="text-xs text-gray-400 mb-1">{new Date(bill.created_at).toLocaleString()}</div>
                                <div className="font-medium text-sm">Served by: <span className="text-[var(--color-foreground)]">{bill.employee?.name || 'Unknown'}</span></div>
                              </div>
                              <div className="font-bold text-[var(--color-gold)] whitespace-nowrap sm:hidden">
                                ₨ {bill.total}
                              </div>
                            </div>
                            <div className="flex-1 bg-black/20 p-2 rounded-lg text-xs sm:text-sm border border-[var(--color-border)] break-words">
                              {bill.items?.map((i: any) => i.service?.name).join(', ') || 'No items'}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="font-bold text-[var(--color-gold)] whitespace-nowrap hidden sm:block">
                                ₨ {bill.total}
                              </div>
                              {bill.payment_status === 'pending' ? (
                                <button onClick={() => { setSelectedBillForPayment(bill); setPaymentAmount(String(bill.total - (bill.payments?.reduce((s:number,p:any)=>s+Number(p.amount),0)||0))); }} className="bg-orange-500 text-black px-3 py-1 text-xs font-bold rounded hover:bg-orange-600 transition-colors">Pay Installment</button>
                              ) : (
                                <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">Paid</span>
                              )}
                            </div>
                            {bill.payments && bill.payments.length > 0 && (
                              <div className="w-full mt-2 pt-2 border-t border-[var(--color-border)] text-xs text-gray-400 col-span-full">
                                <div className="font-bold mb-1">Installments Paid:</div>
                                {bill.payments.map((p: any) => (
                                  <div key={p.id} className="flex justify-between">
                                    <span>{new Date(p.created_at).toLocaleDateString()} - {p.payment_method}</span>
                                    <span className="text-green-400">₨ {p.amount}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between font-bold mt-1 pt-1 border-t border-[var(--color-border)] text-[var(--color-foreground)]">
                                  <span>Remaining:</span>
                                  <span className="text-orange-400">₨ {bill.total - bill.payments.reduce((s:number, p:any) => s + Number(p.amount), 0)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic text-sm text-center py-8">No Udhar history found.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-red-500">Error loading profile data.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {selectedBillForPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Record Payment</h3>
              <button onClick={() => setSelectedBillForPayment(null)} className="text-gray-400 hover:text-[var(--color-foreground)]"><X size={20}/></button>
            </div>
            <form onSubmit={handleMarkPaid} className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg text-sm text-orange-400 mb-4">
                Total Remaining: ₨ {selectedBillForPayment.total - (selectedBillForPayment.payments?.reduce((s:number,p:any)=>s+Number(p.amount),0)||0)}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Payment Amount (₨)</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  max={selectedBillForPayment.total - (selectedBillForPayment.payments?.reduce((s:number,p:any)=>s+Number(p.amount),0)||0)}
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)} 
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-lg font-bold focus:border-[var(--color-gold)] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Transfer Mezan">Transfer Mezan</option>
                  <option value="Transfer UBL">Transfer UBL</option>
                  <option value="Jazz Cash">Jazz Cash</option>
                  <option value="POS Meezan">POS Meezan</option>
                  <option value="POS UBL">POS UBL</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[var(--color-gold)] text-black font-bold py-3 rounded-lg hover:bg-[var(--color-gold-hover)] mt-2">
                Save Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
