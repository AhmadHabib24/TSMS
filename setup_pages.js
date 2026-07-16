const fs = require('fs');
const path = require('path');

const pages = {
  'src/app/customers/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { api.get('/customers').then(res => setCustomers(res.data)); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Users className="text-[var(--color-gold)]" size={32} /> Customers</h1>
        <button className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={20} /> Add</button>
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
        <table className="w-full text-left">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th>Name</th><th>Mobile</th><th>Visits</th><th>Spend</th><th>Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {customers.map((c: any) => (
              <tr key={c.id} className="hover:bg-[var(--color-background)]">
                <td className="py-4">{c.name}</td><td className="py-4">{c.mobile}</td>
                <td className="py-4">{c.visit_count || 0}</td><td className="py-4 text-[var(--color-gold)]">₨ {c.total_spend || 0}</td>
                <td className="py-4"><button className="mr-2"><Edit size={18}/></button><button className="text-red-500"><Trash2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  'src/app/employees/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  useEffect(() => { api.get('/employees').then(res => setEmployees(res.data)); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Briefcase className="text-[var(--color-gold)]" size={32} /> Employees</h1>
        <button className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={20} /> Add</button>
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
        <table className="w-full text-left">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th>Name</th><th>Designation</th><th>Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {employees.map((e: any) => (
              <tr key={e.id} className="hover:bg-[var(--color-background)]">
                <td className="py-4">{e.name}</td><td className="py-4">{e.designation}</td>
                <td className="py-4"><button className="mr-2"><Edit size={18}/></button><button className="text-red-500"><Trash2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  'src/app/services/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { Scissors, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  useEffect(() => { api.get('/services').then(res => setServices(res.data)); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Scissors className="text-[var(--color-gold)]" size={32} /> Services</h1>
        <button className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={20} /> Add</button>
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
        <table className="w-full text-left">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th>Name</th><th>Price</th><th>Duration</th><th>Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {services.map((s: any) => (
              <tr key={s.id} className="hover:bg-[var(--color-background)]">
                <td className="py-4">{s.name}</td><td className="py-4 text-[var(--color-gold)]">₨ {s.price}</td><td className="py-4">{s.duration_minutes} min</td>
                <td className="py-4"><button className="mr-2"><Edit size={18}/></button><button className="text-red-500"><Trash2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  'src/app/inventory/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/inventory-items').then(res => setItems(res.data)); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Package className="text-[var(--color-gold)]" size={32} /> Inventory</h1>
        <button className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={20} /> Add</button>
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
        <table className="w-full text-left">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th>Item Name</th><th>Stock Level</th><th>Threshold</th><th>Actions</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {items.map((i: any) => (
              <tr key={i.id} className="hover:bg-[var(--color-background)]">
                <td className="py-4">{i.name}</td><td className="py-4">{i.stock_level}</td><td className="py-4">{i.low_stock_threshold}</td>
                <td className="py-4"><button className="mr-2"><Edit size={18}/></button><button className="text-red-500"><Trash2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  'src/app/reports/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import api from '@/lib/axios';

export default function ReportsPage() {
  const [bills, setBills] = useState([]);
  useEffect(() => { api.get('/bills').then(res => setBills(res.data)); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="text-[var(--color-gold)]" size={32} /> Recent Bills & Reports</h1>
      </div>
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
        <table className="w-full text-left">
          <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th>ID</th><th>Customer</th><th>Employee</th><th>Total</th><th>Method</th></tr></thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {bills.map((b: any) => (
              <tr key={b.id} className="hover:bg-[var(--color-background)]">
                <td className="py-4">#{b.id}</td>
                <td className="py-4">{b.customer ? b.customer.name : 'Walk-in'}</td>
                <td className="py-4">{b.employee ? b.employee.name : '--'}</td>
                <td className="py-4 text-[var(--color-gold)]">₨ {b.total}</td>
                <td className="py-4 uppercase">{b.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`
};

Object.entries(pages).forEach(([file, content]) => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created ' + file);
});
