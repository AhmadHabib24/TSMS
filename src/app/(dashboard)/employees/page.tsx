'use client';
import { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit, Trash2, X, Image as ImageIcon, Search, Banknote, Calendar, Check, Play } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'directory' | 'salary'>('directory');

  // Directory State
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { can } = usePermissions();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Salary State
  const [salaries, setSalaries] = useState([]);
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);
  const [salaryForm, setSalaryForm] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);

  const fetchData = () => {
    setIsLoadingDirectory(true);
    api.get('/employees').then(res => setData(res.data)).catch(() => toast.error('Failed to load data')).finally(() => setIsLoadingDirectory(false));
  };

  const [isLoadingSalary, setIsLoadingSalary] = useState(true);

  const fetchSalaries = () => {
    setIsLoadingSalary(true);
    api.get(`/salaries?salary_month=${salaryMonth}`).then(res => setSalaries(res.data)).catch(() => toast.error('Failed to load salaries')).finally(() => setIsLoadingSalary(false));
  };

  useEffect(() => { 
    if (activeTab === 'directory') fetchData(); 
    if (activeTab === 'salary') fetchSalaries();
  }, [activeTab, salaryMonth]);

  const filteredData = data.filter((e: any) => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    (e.mobile && e.mobile.includes(search)) ||
    (e.designation && e.designation.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
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
        await api.post(`/employees/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Updated successfully!');
      } else {
        await api.post('/employees', payload, {
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
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  const openEmployeeModal = (item?: any) => {
    setImageFile(null);
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        name: item.name || '', 
        mobile: item.mobile || '',
        cnic: item.cnic || '',
        designation: item.designation || '',
        joining_date: item.joining_date || '',
        base_salary: item.base_salary || '',
        daily_commission: item.daily_commission || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', mobile: '', cnic: '', designation: '', joining_date: '', base_salary: '', daily_commission: '' });
    }
    setIsModalOpen(true);
  };

  // Salary functions
  const generateSalaries = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/salaries/generate', { salary_month: salaryMonth });
      toast.success(res.data.message || 'Salaries generated!');
      fetchSalaries();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Generation failed');
    }
    setIsGenerating(false);
  };

  const openSalaryModal = (salary: any) => {
    setEditingSalary(salary);
    setSalaryForm({
      commission: salary.commission || 0,
      bonus: salary.bonus || 0,
      advance_deduction: salary.advance_deduction || 0,
      is_paid: salary.is_paid ? true : false
    });
    setIsSalaryModalOpen(true);
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/salaries/${editingSalary.id}`, salaryForm);
      toast.success('Salary record updated!');
      setIsSalaryModalOpen(false);
      fetchSalaries();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const totalPayable = (salary: any) => {
    return Number(salary.amount) + Number(salary.commission) + Number(salary.bonus) - Number(salary.advance_deduction);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Briefcase className="text-[var(--color-gold)] w-6 h-6 md:w-8 md:h-8" /> Employee Hub</h1>
        
        <div className="flex flex-col sm:flex-row bg-[var(--color-background)] border border-[var(--color-border)] p-1 rounded-lg w-full lg:w-auto">
          <button onClick={() => setActiveTab('directory')} className={`w-full sm:w-auto justify-center px-4 md:px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 text-sm md:text-base ${activeTab === 'directory' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-[var(--color-foreground)]'}`}>
            Staff Directory
          </button>
          <button onClick={() => setActiveTab('salary')} className={`w-full sm:w-auto justify-center px-4 md:px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 text-sm md:text-base ${activeTab === 'salary' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-[var(--color-foreground)]'}`}>
            <Banknote size={16} className="md:w-[18px] md:h-[18px]" /> Salary Management
          </button>
        </div>
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 sm:top-3 text-gray-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text" 
                placeholder="Search staff..." 
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 pl-9 sm:pl-10 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" 
              />
            </div>
            {can('employees', 'add') && (
              <button onClick={() => openEmployeeModal()} className="w-full sm:w-auto shrink-0 justify-center bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base">
                <Plus size={18} className="sm:w-5 sm:h-5" /> Add New
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingDirectory ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl overflow-hidden p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-32 bg-white/10 animate-pulse rounded"></div>
                      <div className="h-3 w-20 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex justify-between border-b border-[var(--color-border)] pb-2">
                        <div className="h-3 w-16 bg-white/5 animate-pulse rounded"></div>
                        <div className="h-3 w-24 bg-white/5 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : filteredData.map((item: any) => (
              <div key={item.id} className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-gold)] transition-colors group">
                <div className="p-6 relative">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {can('employees', 'edit') && (
                      <button onClick={() => openEmployeeModal(item)} className="p-2 bg-black/50 text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-gold)] hover:text-black transition-colors"><Edit size={16}/></button>
                    )}
                    {can('employees', 'delete') && (
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-black/50 text-[var(--color-foreground)] rounded-lg hover:bg-red-500 transition-colors"><Trash2 size={16}/></button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    {item.image_path ? (
                      <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.image_path}`} alt="img" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[var(--color-gold)] shrink-0" />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-border)] flex items-center justify-center text-gray-400 shrink-0"><ImageIcon size={20} className="sm:w-6 sm:h-6"/></div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)] truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-[var(--color-gold)] font-medium uppercase tracking-wider truncate">{item.designation || 'Staff'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-gray-400">Mobile</span>
                      <span className="text-[var(--color-foreground)] font-medium">{item.mobile || '--'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-gray-400">CNIC</span>
                      <span className="text-[var(--color-foreground)] font-medium">{item.cnic || '--'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-gray-400">Joined</span>
                      <span className="text-[var(--color-foreground)] font-medium">{item.joining_date ? new Date(item.joining_date).toLocaleDateString() : '--'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-b border-[var(--color-border)] pb-2">
                      <span className="text-gray-400">Base Salary</span>
                      <span className="text-[var(--color-gold)] font-bold">₨ {item.base_salary || '0'}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-400">Daily Comm.</span>
                      <span className="text-green-400 font-bold">₨ {item.daily_commission || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-[var(--color-panel)] rounded-xl border border-[var(--color-border)]">
                No employees found
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-xs sm:text-sm">Salary Month</label>
              <div className="bg-black/30 border border-[var(--color-border)] rounded-lg px-3 py-2 sm:px-4 flex items-center gap-2 w-full sm:w-auto">
                <Calendar size={16} className="text-[var(--color-gold)] sm:w-[18px] sm:h-[18px]" />
                <input type="month" value={salaryMonth} onChange={e => setSalaryMonth(e.target.value)} className="bg-transparent text-[var(--color-foreground)] font-bold outline-none text-sm sm:text-base w-full" />
              </div>
            </div>
            <button onClick={generateSalaries} disabled={isGenerating} className="w-full md:w-auto justify-center bg-[var(--color-gold)] text-black px-4 sm:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors disabled:opacity-50 text-sm sm:text-base">
              <Play size={16} className="sm:w-[18px] sm:h-[18px]" /> {isGenerating ? 'Generating...' : 'Generate Drafts for Month'}
            </button>
          </div>

          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-gray-400 text-sm uppercase tracking-wider bg-black/30">
                  <th className="py-4 px-6 font-bold">Employee</th>
                  <th className="py-4 px-4 font-bold text-right">Base</th>
                  <th className="py-4 px-4 font-bold text-green-400 text-right">+ Comm.</th>
                  <th className="py-4 px-4 font-bold text-blue-400 text-right">+ Bonus</th>
                  <th className="py-4 px-4 font-bold text-red-400 text-right">- Advance</th>
                  <th className="py-4 px-4 font-bold text-right">Total Payable</th>
                  <th className="py-4 px-4 font-bold text-center">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoadingSalary ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-[var(--color-background)] transition-colors">
                      <td className="py-4 px-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                        <div className="h-4 w-24 bg-white/10 animate-pulse rounded"></div>
                      </td>
                      <td className="py-4 px-4 text-right"><div className="h-4 w-16 bg-white/5 animate-pulse rounded ml-auto"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-4 w-12 bg-white/5 animate-pulse rounded ml-auto"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-4 w-12 bg-white/5 animate-pulse rounded ml-auto"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-4 w-12 bg-white/5 animate-pulse rounded ml-auto"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-6 w-20 bg-white/10 animate-pulse rounded ml-auto"></div></td>
                      <td className="py-4 px-4 text-center"><div className="h-6 w-16 bg-white/5 animate-pulse rounded-full mx-auto"></div></td>
                      <td className="py-4 px-6 text-right"><div className="h-5 w-5 bg-white/10 animate-pulse rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : salaries.map((s: any) => {
                  const total = totalPayable(s);
                  return (
                    <tr key={s.id} className="hover:bg-[var(--color-background)] transition-colors">
                      <td className="py-4 px-6 font-bold text-[var(--color-foreground)] flex items-center gap-2">
                        {s.employee?.image_path ? (
                           <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${s.employee.image_path}`} alt="img" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                           <div className="w-8 h-8 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-xs"><ImageIcon size={12}/></div>
                        )}
                        {s.employee?.name}
                      </td>
                      <td className="py-4 px-4 text-right">₨ {s.amount}</td>
                      <td className="py-4 px-4 text-right text-green-400">₨ {s.commission}</td>
                      <td className="py-4 px-4 text-right text-blue-400">₨ {s.bonus}</td>
                      <td className="py-4 px-4 text-right text-red-400">₨ {s.advance_deduction}</td>
                      <td className="py-4 px-4 text-right font-black text-[var(--color-gold)] text-lg">₨ {total}</td>
                      <td className="py-4 px-4 text-center">
                        {s.is_paid ? (
                          <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30">
                            <Check size={12}/> Paid
                          </span>
                        ) : (
                          <span className="inline-block bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => openSalaryModal(s)} className="text-gray-400 hover:text-[var(--color-gold)] transition-colors"><Edit size={18}/></button>
                      </td>
                    </tr>
                  )
                })}
                {salaries.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-500">No salary records for this month. Click Generate Drafts to start.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Directory Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)] shrink-0">
              <h2 className="text-lg sm:text-2xl font-bold truncate pr-2">{editingId ? 'Edit Employee Profile' : 'Add New Staff Member'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)] shrink-0"><X size={20} className="sm:w-6 sm:h-6" /></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto grow custom-scrollbar">
              <form onSubmit={handleEmployeeSubmit} className="space-y-4 sm:space-y-6">
                
                <div className="bg-[var(--color-background)] p-3 sm:p-4 rounded-xl border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full overflow-hidden">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-panel)] flex items-center justify-center border border-[var(--color-border)] shrink-0">
                    <ImageIcon size={20} className="sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0 w-full overflow-hidden">
                    <label className="block text-xs sm:text-sm font-bold text-gray-300 mb-1">Profile Photo (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-[var(--color-gold)] file:text-black hover:file:bg-[var(--color-gold-hover)] cursor-pointer truncate" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-1 sm:mb-2">Full Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" placeholder="e.g. Ali Khan" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-1 sm:mb-2">Designation</label>
                    <input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" placeholder="e.g. Senior Barber" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-1 sm:mb-2">Mobile Number</label>
                    <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" placeholder="0300 1234567" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-1 sm:mb-2">CNIC</label>
                    <input value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" placeholder="12345-1234567-1" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-1 sm:mb-2">Joining Date</label>
                    <input type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none text-[var(--color-foreground)]" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-1 sm:mb-2">Base Salary (₨)</label>
                    <input value={formData.base_salary} onChange={e => setFormData({...formData, base_salary: e.target.value})} type="number" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-1 sm:mb-2">Daily Commission (₨)</label>
                    <input value={formData.daily_commission} onChange={e => setFormData({...formData, daily_commission: e.target.value})} type="number" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-[var(--color-gold)] outline-none" placeholder="0" />
                  </div>
                </div>
                
                <div className="pt-4 mt-4 sm:mt-6 border-t border-[var(--color-border)]">
                  <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-[var(--color-gold-hover)] transition-transform hover:scale-[1.01] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    {editingId ? 'Save Profile Changes' : 'Create Staff Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Salary Edit Modal */}
      {isSalaryModalOpen && editingSalary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)] shrink-0">
              <h2 className="text-lg sm:text-xl font-bold flex flex-col pr-2">
                <span>Adjust Salary</span>
                <span className="text-[var(--color-gold)] text-xs sm:text-sm truncate">{editingSalary.employee?.name} - {salaryMonth}</span>
              </h2>
              <button type="button" onClick={() => setIsSalaryModalOpen(false)} className="text-gray-400 hover:text-[var(--color-foreground)] shrink-0"><X size={20} className="sm:w-6 sm:h-6" /></button>
            </div>
            
            <div className="overflow-y-auto grow custom-scrollbar p-4 sm:p-6">
              <form onSubmit={handleSalarySubmit} className="space-y-3 sm:space-y-4">
                <div className="bg-black/30 p-3 sm:p-4 rounded-lg flex justify-between items-center border border-[var(--color-border)]">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Base Salary</span>
                  <span className="text-base sm:text-lg font-bold">₨ {editingSalary.amount}</span>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-green-400 mb-1 sm:mb-2">+ Commission (₨)</label>
                  <input type="number" min="0" value={salaryForm.commission} onChange={e => setSalaryForm({...salaryForm, commission: e.target.value})} className="w-full bg-[var(--color-background)] border border-green-500/30 rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-green-500 outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-blue-400 mb-1 sm:mb-2">+ Bonus (₨)</label>
                  <input type="number" min="0" value={salaryForm.bonus} onChange={e => setSalaryForm({...salaryForm, bonus: e.target.value})} className="w-full bg-[var(--color-background)] border border-blue-500/30 rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-red-400 mb-1 sm:mb-2">- Advance Deduction (₨)</label>
                  <input type="number" min="0" value={salaryForm.advance_deduction} onChange={e => setSalaryForm({...salaryForm, advance_deduction: e.target.value})} className="w-full bg-[var(--color-background)] border border-red-500/30 rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:border-red-500 outline-none" />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-background)] transition-colors">
                    <input type="checkbox" checked={salaryForm.is_paid} onChange={e => setSalaryForm({...salaryForm, is_paid: e.target.checked})} className="w-4 h-4 sm:w-5 sm:h-5 accent-[var(--color-gold)] shrink-0" />
                    <span className="font-bold text-sm sm:text-base">Mark as Paid</span>
                  </label>
                </div>

                <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-[var(--color-gold-hover)] mt-2 sm:mt-4">
                  Save & Update
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
