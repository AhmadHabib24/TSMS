"use client";

import { useEffect, useState } from 'react';
import { Users, DollarSign, ArrowDownRight, Activity, ShoppingCart, Percent, UserCheck } from 'lucide-react';
import api from '@/lib/axios';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();
  const { user } = useAuthStore();
  const [data, setData] = useState({
    customers: [],
    bills: [],
    pnl: null,
    inventory: null,
    employees: [],
    sales: null,
    discounts: []
  } as any);

  const fetchAllData = async () => {
    try {
      const [
        custRes,
        billRes,
        pnlRes,
        invRes,
        empRes,
        salesRes,
        discRes
      ] = await Promise.all([
        api.get('/customers'),
        api.get('/bills'),
        api.get('/reports/pnl-report'),
        api.get('/reports/inventory-report'),
        api.get('/reports/employee-performance'),
        api.get('/reports/sales-report'),
        api.get('/reports/discount-report')
      ]);

      setData({
        customers: custRes.data,
        bills: billRes.data,
        pnl: pnlRes.data,
        inventory: invRes.data,
        employees: empRes.data,
        sales: salesRes.data,
        discounts: discRes.data
      });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user && user.role_id === 1) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Re-fetch data instantly when a Pusher notification is received!
  useEffect(() => {
    if (notifications.length > 0 && user?.role_id === 1) {
      fetchAllData();
    }
  }, [notifications.length]);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-xl text-gray-400">Loading Dashboard...</div>;
  }

  if (user?.role_id !== 1) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="p-6 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full mb-4">
          <UserCheck size={64} />
        </div>
        <h1 className="text-4xl font-bold text-center">Welcome Back, {user?.name}!</h1>
        <p className="text-gray-400 text-lg text-center max-w-md">
          You are logged in to the TSMS system. Use the sidebar to navigate to your assigned modules.
        </p>
      </div>
    );
  }

  const { customers, bills, pnl, inventory, employees, sales, discounts } = data;

  // Sorting for recents
  const recentCustomers = [...customers].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  const recentBills = [...bills].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

  const topEmployee = employees.length > 0 ? employees[0] : null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Row 1: Top 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value={customers.length} icon={<Users size={24} />} />
        <StatCard title="Total Revenue" value={`₨ ${pnl?.total_income?.toLocaleString() ?? 0}`} icon={<DollarSign size={24} />} />
        <StatCard title="Total Expenses" value={`₨ ${pnl?.total_expenses?.toLocaleString() ?? 0}`} icon={<ArrowDownRight size={24} />} />
        <StatCard title="Net Profit" value={`₨ ${pnl?.net_profit?.toLocaleString() ?? 0}`} icon={<Activity size={24} />} />
      </div>

      {/* Row 2: Overviews (2 per row) */}
      <h2 className="text-xl font-bold mt-10 border-b border-[var(--color-border)] pb-2">Quick Report Overviews</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><ShoppingCart size={24}/></div>
            <h3 className="text-lg font-semibold">Inventory Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-gray-400 text-sm">Total Items</p><p className="text-xl font-bold">{inventory?.total_unique_items || 0}</p></div>
            <div><p className="text-gray-400 text-sm">Total Stock</p><p className="text-xl font-bold">{inventory?.total_stock || 0}</p></div>
            <div><p className="text-red-400 text-sm">Low Stock</p><p className="text-xl font-bold text-red-500">{inventory?.low_stock_count || 0}</p></div>
          </div>
        </div>

        {/* Employee Performance Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><UserCheck size={24}/></div>
            <h3 className="text-lg font-semibold">Top Employee</h3>
          </div>
          {topEmployee ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{topEmployee.name}</p>
                <p className="text-sm text-gray-400">{topEmployee.designation}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Revenue Generated</p>
                <p className="text-xl font-bold text-[var(--color-gold)]">₨ {topEmployee.revenue.toLocaleString()}</p>
              </div>
            </div>
          ) : <p className="text-gray-500 text-sm">No employee data</p>}
        </div>

        {/* Sales Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><DollarSign size={24}/></div>
            <h3 className="text-lg font-semibold">Sales Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-gray-400 text-sm">Total Bills Generated</p><p className="text-xl font-bold">{bills.length}</p></div>
            <div><p className="text-gray-400 text-sm">Average Bill Size</p><p className="text-xl font-bold">₨ {bills.length ? Math.round(pnl?.total_sales / bills.length).toLocaleString() : 0}</p></div>
          </div>
        </div>

        {/* Discount Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><Percent size={24}/></div>
            <h3 className="text-lg font-semibold">Discount Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-gray-400 text-sm">Bills with Discount</p><p className="text-xl font-bold">{discounts.length}</p></div>
            <div><p className="text-gray-400 text-sm">Total Discount Given</p><p className="text-xl font-bold text-yellow-500">₨ {discounts.reduce((sum: number, b: any) => sum + (Number(b.discount_amount) || 0), 0).toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Customers & Recent Bills */}
      <h2 className="text-xl font-bold mt-10 border-b border-[var(--color-border)] pb-2">Recent Activity</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 overflow-hidden flex flex-col h-96">
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-gold)]">Recent 10 Customers</h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <div className="space-y-3">
              {recentCustomers.map((c: any) => (
                <div key={c.id} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.mobile || 'No Phone'}</p>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              ))}
              {recentCustomers.length === 0 && <p className="text-sm text-gray-500">No customers found.</p>}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 overflow-hidden flex flex-col h-96">
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-gold)]">Recent 10 Bills</h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <div className="space-y-3">
              {recentBills.map((b: any) => (
                <div key={b.id} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="font-medium">Invoice #{b.id}</p>
                    <p className="text-xs text-gray-400">{b.customer?.name || 'Walk-in'} • {b.employee?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-gold)]">₨ {b.total}</p>
                    <p className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {recentBills.length === 0 && <p className="text-sm text-gray-500">No bills found.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Charts */}
      <h2 className="text-xl font-bold mt-10 border-b border-[var(--color-border)] pb-2">Analytics Visualizations</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Trend (Line Chart) */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-96">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Trend</h3>
          <div className="h-full pb-8">
            <Line 
              data={{
                labels: sales?.monthly?.map((m: any) => m.label) || [],
                datasets: [{
                  label: 'Revenue (₨)',
                  data: sales?.monthly?.map((m: any) => m.value) || [],
                  borderColor: '#E6B93D',
                  backgroundColor: 'rgba(230, 185, 61, 0.2)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Expenses Pie Chart */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-96">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <div className="h-full pb-8 flex justify-center">
            <Pie 
              data={{
                labels: pnl?.expenses_by_category?.map((e: any) => e.label) || [],
                datasets: [{
                  data: pnl?.expenses_by_category?.map((e: any) => e.value) || [],
                  backgroundColor: ['#E6B93D', '#4CAF50', '#F44336', '#2196F3', '#9C27B0', '#FF9800'],
                  borderWidth: 0
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Employee Revenue Bar Chart */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-96">
          <h3 className="text-lg font-semibold mb-4">Revenue by Employee</h3>
          <div className="h-full pb-8">
            <Bar 
              data={{
                labels: employees.map((e: any) => e.name),
                datasets: [{
                  label: 'Revenue (₨)',
                  data: employees.map((e: any) => e.revenue),
                  backgroundColor: '#E6B93D',
                  borderRadius: 4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Top Inventory Bar Chart */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-96">
          <h3 className="text-lg font-semibold mb-4">Top Consumed Inventory</h3>
          <div className="h-full pb-8">
            <Bar 
              data={{
                labels: inventory?.top_consumed?.map((i: any) => i.name) || [],
                datasets: [{
                  label: 'Amount Consumed',
                  data: inventory?.top_consumed?.map((i: any) => i.amount_consumed) || [],
                  backgroundColor: '#4CAF50',
                  borderRadius: 4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

      </div>

    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col justify-between group hover:border-[var(--color-gold)] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium">{title}</h3>
        <div className="text-[var(--color-gold)] p-2 rounded-lg bg-[var(--color-gold)]/10 group-hover:bg-[var(--color-gold)] group-hover:text-black transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold">{value}</div>
        {trend && (
          <div className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {trend} from yesterday
          </div>
        )}
      </div>
    </div>
  );
}
