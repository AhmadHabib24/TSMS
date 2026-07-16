'use client';
import { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, X, Layers, TrendingDown, Printer, Image as ImageIcon, CheckCircle, Palette } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/providers/SettingsProvider';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'service_categories' | 'expense_categories' | 'print_settings' | 'general_settings'>('service_categories');
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Print Settings State
  const [printSettings, setPrintSettings] = useState<any>({
    salon_name: '', address: '', phone: '', footer_text: '', active_template: 'thermal_1'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // General Settings State
  const { refreshSettings } = useSettings();
  const [generalSettings, setGeneralSettings] = useState<any>({
    app_name: '', theme_color: '#D4AF37', font_family: 'Outfit'
  });
  const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null);
  const [lightLogoFile, setLightLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const [darkLogoPreview, setDarkLogoPreview] = useState<string | null>(null);
  const [lightLogoPreview, setLightLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const { can } = usePermissions();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'print_settings') {
        const res = await api.get('/print-settings');
        setPrintSettings(res.data);
        if (res.data.logo_path) {
          setLogoPreview(`${process.env.NEXT_PUBLIC_STORAGE_URL}/${res.data.logo_path}`);
        }
      } else if (activeTab === 'general_settings') {
        const res = await api.get('/general-settings');
        setGeneralSettings(res.data);
        if (res.data.dark_logo_path) setDarkLogoPreview(`${process.env.NEXT_PUBLIC_STORAGE_URL}/${res.data.dark_logo_path}`);
        if (res.data.light_logo_path) setLightLogoPreview(`${process.env.NEXT_PUBLIC_STORAGE_URL}/${res.data.light_logo_path}`);
        if (res.data.favicon_path) setFaviconPreview(`${process.env.NEXT_PUBLIC_STORAGE_URL}/${res.data.favicon_path}`);
      } else {
        const endpoint = activeTab === 'service_categories' ? '/service-categories' : '/expense-categories';
        const res = await api.get(endpoint);
        setData(res.data);
      }
    } catch (e) {
      toast.error('Failed to load data');
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'service_categories' ? '/service-categories' : '/expense-categories';
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, formData);
        toast.success('Updated successfully!');
      } else {
        await api.post(endpoint, formData);
        toast.success('Added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Operation failed.');
    }
  };

  const handlePrintSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(printSettings).forEach(key => {
        if (printSettings[key] !== null) payload.append(key, printSettings[key]);
      });
      if (logoFile) {
        payload.append('logo', logoFile);
      }
      await api.post('/print-settings', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Print settings updated successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update print settings');
    }
  };

  const handleGeneralSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append('app_name', generalSettings.app_name || '');
      payload.append('theme_color', generalSettings.theme_color || '#D4AF37');
      payload.append('font_family', generalSettings.font_family || 'Outfit');
      
      if (darkLogoFile) payload.append('dark_logo', darkLogoFile);
      if (lightLogoFile) payload.append('light_logo', lightLogoFile);
      if (faviconFile) payload.append('favicon', faviconFile);

      await api.post('/general-settings', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('General settings updated successfully!');
      refreshSettings();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update general settings');
    }
    setIsLoading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? (This might fail if records are attached)')) {
      try {
        const endpoint = activeTab === 'service_categories' ? '/service-categories' : '/expense-categories';
        await api.delete(`${endpoint}/${id}`);
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
      setFormData({ name: item.name || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const canAdd = can('service_categories', 'add');
  const canEdit = can('service_categories', 'edit');
  const canDelete = can('service_categories', 'delete');

  const templates = [
    { id: 'thermal_1', name: 'Thermal Standard (80mm)', desc: 'Classic centered receipt layout.' },
    { id: 'thermal_2', name: 'Thermal Minimalist (80mm)', desc: 'Sleek left-aligned modern receipt.' },
    { id: 'a4_1', name: 'A4 Professional', desc: 'Full page layout for standard printers.' },
  ];

  const fontOptions = [
    { id: 'Outfit', name: 'Outfit (Modern & Clean)' },
    { id: 'Inter', name: 'Inter (Professional & Crisp)' },
    { id: 'Roboto', name: 'Roboto (Classic & Readable)' },
    { id: 'Playfair Display', name: 'Playfair Display (Elegant & Serif)' },
    { id: 'Montserrat', name: 'Montserrat (Bold & Geometric)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Settings className="text-[var(--color-gold)]" size={32} /> System Settings</h1>
        
        <div className="flex bg-[var(--color-background)] border border-[var(--color-border)] p-1 rounded-lg overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('general_settings')} className={`px-4 md:px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'general_settings' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            <Palette size={18} /> General Settings
          </button>
          <button onClick={() => setActiveTab('print_settings')} className={`px-4 md:px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'print_settings' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            <Printer size={18} /> Print Settings
          </button>
          <button onClick={() => setActiveTab('service_categories')} className={`px-4 md:px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'service_categories' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            <Layers size={18} /> Service Categories
          </button>
          <button onClick={() => setActiveTab('expense_categories')} className={`px-4 md:px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'expense_categories' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            <TrendingDown size={18} /> Expense Categories
          </button>
        </div>
        
        {activeTab !== 'print_settings' && activeTab !== 'general_settings' && canAdd && (
          <button onClick={() => openModal()} className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors shrink-0">
            <Plus size={20} /> Add Category
          </button>
        )}
      </div>

      {activeTab === 'general_settings' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleGeneralSettingsSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Palette size={20} className="text-[var(--color-gold)]"/> Branding & Identity</h2>
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">App Name</label>
                <input value={generalSettings.app_name || ''} onChange={e => setGeneralSettings({...generalSettings, app_name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-white font-bold text-lg" placeholder="e.g. PLAYBOY SALON" />
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-[var(--color-border)]">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-black border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                    {darkLogoPreview ? <img src={darkLogoPreview} alt="Dark Logo" className="w-full h-full object-contain p-1" /> : <ImageIcon size={24} className="text-gray-500"/>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">Dark Logo (For light backgrounds)</label>
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if(file) { setDarkLogoFile(file); setDarkLogoPreview(URL.createObjectURL(file)); }
                    }} className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[var(--color-border)] file:text-white hover:file:bg-gray-700 cursor-pointer text-gray-400" />
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-white border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                    {lightLogoPreview ? <img src={lightLogoPreview} alt="Light Logo" className="w-full h-full object-contain p-1" /> : <ImageIcon size={24} className="text-gray-500"/>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">Light Logo (For dark backgrounds)</label>
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if(file) { setLightLogoFile(file); setLightLogoPreview(URL.createObjectURL(file)); }
                    }} className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[var(--color-border)] file:text-white hover:file:bg-gray-700 cursor-pointer text-gray-400" />
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-black border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                    {faviconPreview ? <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain p-1" /> : <ImageIcon size={24} className="text-gray-500"/>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">Favicon (Browser Tab Icon)</label>
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if(file) { setFaviconFile(file); setFaviconPreview(URL.createObjectURL(file)); }
                    }} className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[var(--color-border)] file:text-white hover:file:bg-gray-700 cursor-pointer text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 space-y-6 flex flex-col">
              <h2 className="text-xl font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Settings size={20} className="text-[var(--color-gold)]"/> Theme Customization</h2>
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Primary Theme Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={generalSettings.theme_color || '#D4AF37'} onChange={e => setGeneralSettings({...generalSettings, theme_color: e.target.value})} className="w-16 h-16 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                  <input type="text" value={generalSettings.theme_color || '#D4AF37'} onChange={e => setGeneralSettings({...generalSettings, theme_color: e.target.value})} className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-white uppercase font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Font Family</label>
                <div className="space-y-3">
                  {fontOptions.map(font => (
                    <label key={font.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${generalSettings.font_family === font.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10' : 'border-[var(--color-border)] hover:border-gray-500'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${generalSettings.font_family === font.id ? 'border-[var(--color-gold)]' : 'border-gray-500'}`}>
                        {generalSettings.font_family === font.id && <div className="w-2.5 h-2.5 bg-[var(--color-gold)] rounded-full"></div>}
                      </div>
                      <span className="font-bold text-white" style={{ fontFamily: font.id }}>{font.name}</span>
                      <input type="radio" name="font_family" value={font.id} checked={generalSettings.font_family === font.id} onChange={() => setGeneralSettings({...generalSettings, font_family: font.id})} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button type="submit" disabled={isLoading} className="w-full bg-[var(--color-gold)] text-black py-4 rounded-xl font-bold text-lg hover:bg-[var(--color-gold-hover)] transition-transform hover:scale-[1.02] flex justify-center items-center gap-2">
                  {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><CheckCircle size={20}/> Save Settings Globally</>}
                </button>
              </div>
            </div>

          </form>
        </div>
      ) : activeTab === 'print_settings' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handlePrintSettingsSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Settings size={20} className="text-[var(--color-gold)]"/> Receipt Details</h2>
              
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl bg-black/50 border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon size={32} className="text-gray-500"/>}
                </div>
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Salon Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[var(--color-gold)] file:text-black hover:file:bg-[var(--color-gold-hover)] cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Salon Name</label>
                <input value={printSettings.salon_name || ''} onChange={e => setPrintSettings({...printSettings, salon_name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-white" placeholder="The Golden Scissors" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Phone Number</label>
                  <input value={printSettings.phone || ''} onChange={e => setPrintSettings({...printSettings, phone: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-white" placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Address</label>
                  <input value={printSettings.address || ''} onChange={e => setPrintSettings({...printSettings, address: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-white" placeholder="123 Main St, City" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Footer Note</label>
                <textarea value={printSettings.footer_text || ''} onChange={e => setPrintSettings({...printSettings, footer_text: e.target.value})} rows={3} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-white resize-none" placeholder="Thank you for your visit! Follow us on IG @salon" />
              </div>
            </div>

            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 space-y-6 flex flex-col">
              <h2 className="text-xl font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Printer size={20} className="text-[var(--color-gold)]"/> Template Selection</h2>
              
              <div className="space-y-4 flex-1">
                {templates.map(t => (
                  <label key={t.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${printSettings.active_template === t.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[var(--color-border)] hover:border-gray-500'}`}>
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${printSettings.active_template === t.id ? 'border-[var(--color-gold)]' : 'border-gray-500'}`}>
                        {printSettings.active_template === t.id && <div className="w-2.5 h-2.5 bg-[var(--color-gold)] rounded-full"></div>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-white">{t.name}</div>
                      <div className="text-sm text-gray-400">{t.desc}</div>
                    </div>
                    {printSettings.active_template === t.id && <CheckCircle className="text-[var(--color-gold)] mt-1" size={20} />}
                    <input type="radio" name="template" value={t.id} checked={printSettings.active_template === t.id} onChange={() => setPrintSettings({...printSettings, active_template: t.id})} className="hidden" />
                  </label>
                ))}
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-[var(--color-gold)] text-black py-4 rounded-xl font-bold text-lg hover:bg-[var(--color-gold-hover)] transition-transform hover:scale-[1.02] flex justify-center items-center gap-2">
                {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><Settings size={20}/> Save Print Settings</>}
              </button>
            </div>

          </form>
        </div>
      ) : (
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-gray-400 text-sm uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold">Category Name</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      {activeTab === 'service_categories' ? <Layers className="text-[var(--color-gold)]" size={16}/> : <TrendingDown className="text-red-500" size={16}/>}
                      {item.name}
                    </td>
                    <td className="py-4 px-6 flex justify-end gap-2">
                      {canEdit && (
                        <button onClick={() => openModal(item)} className="p-2 bg-black/50 text-white rounded hover:bg-[var(--color-gold)] hover:text-black transition-colors"><Edit size={16}/></button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-black/50 text-white rounded hover:bg-red-500 transition-colors"><Trash2 size={16}/></button>
                      )}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={2} className="py-12 text-center text-gray-500">No categories found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isModalOpen && activeTab !== 'print_settings' && activeTab !== 'general_settings' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {activeTab === 'service_categories' ? <Layers className="text-[var(--color-gold)]"/> : <TrendingDown className="text-red-500"/>}
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Category Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 px-4 focus:border-[var(--color-gold)] outline-none text-white" placeholder="e.g. Rent, Marketing, Haircut..." />
              </div>
              
              <button type="submit" className="w-full bg-[var(--color-gold)] text-black py-3 rounded-lg font-bold mt-6 hover:bg-[var(--color-gold-hover)] transition-colors">
                {editingId ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
