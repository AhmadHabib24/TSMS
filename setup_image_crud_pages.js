const fs = require('fs');
const path = require('path');

const generateCrudPage = (entityName, icon, endpoint, fields, formFields, tableHeaders, rowData) => {
  return `'use client';
import { useState, useEffect } from 'react';
import { ${icon}, Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ${entityName}Page() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Using a single state for all fields
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchData = () => {
    api.get('${endpoint}').then(res => setData(res.data)).catch(() => toast.error('Failed to load data'));
  };

  useEffect(() => { fetchData(); }, []);

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
        // Laravel uses POST with _method=PUT for multipart/form-data updates
        payload.append('_method', 'PUT');
        await api.post(\`${endpoint}/\${editingId}\`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Updated successfully!');
      } else {
        await api.post('${endpoint}', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this?')) {
      try {
        await api.delete(\`${endpoint}/\${id}\`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (item?: any) => {
    setImageFile(null);
    if (item) {
      setEditingId(item.id);
      const initData: any = {};
      Object.keys(${JSON.stringify(formFields)}).forEach(k => initData[k] = item[k] || '');
      setFormData(initData);
    } else {
      setEditingId(null);
      const initData: any = {};
      Object.keys(${JSON.stringify(formFields)}).forEach(k => initData[k] = '');
      setFormData(initData);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><${icon} className="text-[var(--color-gold)]" size={32} /> ${entityName}</h1>
        <button onClick={() => openModal()} className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-gold-hover)] transition-colors"><Plus size={20} /> Add New</button>
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th>Image</th>${tableHeaders.map(h => `<th>${h}</th>`).join('')}<th>Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-[var(--color-background)] transition-colors">
                <td className="py-4">
                  {item.image_path ? (
                    <img src={\`http://127.0.0.1:8000/storage/\${item.image_path}\`} alt="img" className="w-12 h-12 rounded-full object-cover border border-[var(--color-gold)]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-border)] flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>
                  )}
                </td>
                ${rowData}
                <td className="py-4">
                  <button onClick={() => openModal(item)} className="mr-3 text-gray-400 hover:text-white transition-colors"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={${tableHeaders.length + 2}} className="py-8 text-center text-gray-500">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Add New'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-gold)] file:text-black hover:file:bg-[var(--color-gold-hover)]" />
              </div>
              ${Object.keys(formFields).map(k => `
              <div>
                <label className="block text-sm text-gray-400 mb-1 capitalize">${k.replace(/_/g, ' ')}</label>
                <input required value={formData.${k}} onChange={e => setFormData({...formData, ${k}: e.target.value})} type="${formFields[k]}" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-gold)] outline-none" />
              </div>
              `).join('')}
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
`;
};

const pages = {
  'src/app/customers/page.tsx': generateCrudPage('Customers', 'Users', '/customers', 
    ['name', 'mobile'], 
    { name: 'text', mobile: 'text' }, 
    ['Name', 'Mobile', 'Visits', 'Spend'], 
    '<td className="py-4">{item.name}</td><td className="py-4">{item.mobile}</td><td className="py-4">{item.visit_count || 0}</td><td className="py-4 text-[var(--color-gold)]">₨ {item.total_spend || 0}</td>'
  ),
  'src/app/employees/page.tsx': generateCrudPage('Employees', 'Briefcase', '/employees', 
    ['name', 'designation', 'mobile'], 
    { name: 'text', designation: 'text', mobile: 'text' }, 
    ['Name', 'Designation', 'Mobile'], 
    '<td className="py-4">{item.name}</td><td className="py-4">{item.designation}</td><td className="py-4">{item.mobile}</td>'
  ),
  'src/app/inventory/page.tsx': generateCrudPage('Inventory', 'Package', '/inventory-items', 
    ['name', 'stock_level', 'low_stock_threshold'], 
    { name: 'text', stock_level: 'number', low_stock_threshold: 'number' }, 
    ['Item Name', 'Stock Level', 'Threshold'], 
    '<td className="py-4">{item.name}</td><td className="py-4">{item.stock_level}</td><td className="py-4">{item.low_stock_threshold}</td>'
  )
};

Object.entries(pages).forEach(([file, content]) => {
  const fullPath = path.join(__dirname, file);
  fs.writeFileSync(fullPath, content);
  console.log('Created full CRUD for ' + file);
});
