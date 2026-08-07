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
  const [isFetching, setIsFetching] = useState(true);
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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAllData = async () => {
    setLoading(false);
    setIsFetching(true);
    
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';

    try {
      const [customers, bills, pnl, inventory, employees, sales, discounts] = await Promise.all([
        api.get(`/customers${qs}`),
        api.get(`/bills${qs}`),
        api.get(`/reports/pnl-report${qs}`),
        api.get(`/reports/inventory-report${qs}`),
        api.get(`/reports/employee-performance${qs}`),
        api.get(`/reports/sales-report${qs}`),
        api.get(`/reports/discount-report${qs}`)
      ]);
      setData({
        customers: customers.data,
        bills: bills.data,
        pnl: pnl.data,
        inventory: inventory.data,
        employees: employees.data,
        sales: sales.data,
        discounts: discounts.data
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  // Initial load and filter change
  useEffect(() => {
    if (user && user.role_id === 1) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user, startDate, endDate]);

  // Re-fetch data instantly when a Pusher notification is received!
  useEffect(() => {
    if (notifications.length > 0 && user?.role_id === 1) {
      fetchAllData();
    }
  }, [notifications.length]);

  if (loading) return null;

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

  const recentCustomers = [...customers].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  const recentBills = [...bills].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  const topPendingUdhar = [...customers].filter((c: any) => c.pending_balance > 0).sort((a: any, b: any) => b.pending_balance - a.pending_balance).slice(0, 10);

  const topEmployee = employees.length > 0 ? employees[0] : null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--color-panel)] p-2 rounded-xl border border-[var(--color-border)] w-full sm:w-auto">
          <div className="flex flex-col w-full sm:w-auto">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-1.5 px-3 text-sm focus:border-[var(--color-gold)] outline-none text-[var(--color-foreground)]" />
          </div>
          <span className="text-gray-500 hidden sm:inline">-</span>
          <div className="flex flex-col w-full sm:w-auto">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-1.5 px-3 text-sm focus:border-[var(--color-gold)] outline-none text-[var(--color-foreground)]" />
          </div>
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="w-full sm:w-auto px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Top 5 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard isFetching={isFetching} title="Total Customers" value={customers.length} icon={<Users size={24} />} />
        <StatCard isFetching={isFetching} title="Collected Revenue" value={`₨ ${pnl?.total_income?.toLocaleString() ?? 0}`} icon={<DollarSign size={24} />} />
        <StatCard isFetching={isFetching} title="Pending Payments" value={`₨ ${pnl?.pending_payments?.toLocaleString() ?? 0}`} icon={<Activity size={24} />} />
        <StatCard isFetching={isFetching} title="Total Expenses" value={`₨ ${pnl?.total_expenses?.toLocaleString() ?? 0}`} icon={<ArrowDownRight size={24} />} />
        <StatCard isFetching={isFetching} title="Net Profit" value={`₨ ${pnl?.net_profit?.toLocaleString() ?? 0}`} icon={<DollarSign size={24} />} />
      </div>

      {/* Row 2: Overviews (2 per row) */}
      <h2 className="text-lg sm:text-xl font-bold mt-8 sm:mt-10 border-b border-[var(--color-border)] pb-2">Quick Report Overviews</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Inventory Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6"/></div>
            <h3 className="text-base sm:text-lg font-semibold">Inventory Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div><p className="text-gray-400 text-xs sm:text-sm">Total Items</p>{isFetching ? <div className="h-7 w-12 bg-white/10 animate-pulse rounded mx-auto mt-1"></div> : <p className="text-lg sm:text-xl font-bold">{inventory?.total_unique_items || 0}</p>}</div>
            <div><p className="text-gray-400 text-xs sm:text-sm">Total Stock</p>{isFetching ? <div className="h-7 w-12 bg-white/10 animate-pulse rounded mx-auto mt-1"></div> : <p className="text-lg sm:text-xl font-bold">{inventory?.total_stock || 0}</p>}</div>
            <div><p className="text-red-400 text-xs sm:text-sm">Low Stock</p>{isFetching ? <div className="h-7 w-12 bg-white/10 animate-pulse rounded mx-auto mt-1"></div> : <p className="text-lg sm:text-xl font-bold text-red-500">{inventory?.low_stock_count || 0}</p>}</div>
          </div>
        </div>

        {/* Employee Performance Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><UserCheck className="w-5 h-5 sm:w-6 sm:h-6"/></div>
            <h3 className="text-base sm:text-lg font-semibold">Top Employee</h3>
          </div>
          {isFetching ? (
            <div className="flex justify-between items-center">
              <div><div className="h-6 w-24 bg-white/10 animate-pulse rounded mb-1"></div><div className="h-4 w-16 bg-white/10 animate-pulse rounded"></div></div>
              <div className="text-right"><div className="h-4 w-20 bg-white/10 animate-pulse rounded mb-1 ml-auto"></div><div className="h-6 w-20 bg-white/10 animate-pulse rounded ml-auto"></div></div>
            </div>
          ) : topEmployee ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div>
                <p className="font-bold text-base sm:text-lg">{topEmployee.name}</p>
                <p className="text-xs sm:text-sm text-gray-400">{topEmployee.designation}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-gray-400 text-xs sm:text-sm">Revenue Generated</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--color-gold)]">₨ {topEmployee.revenue.toLocaleString()}</p>
              </div>
            </div>
          ) : <p className="text-gray-500 text-sm">No employee data</p>}
        </div>

        {/* Sales Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6"/></div>
            <h3 className="text-base sm:text-lg font-semibold">Sales Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
            <div><p className="text-gray-400 text-xs sm:text-sm">Total Bills Generated</p>{isFetching ? <div className="h-7 w-12 bg-white/10 animate-pulse rounded mx-auto mt-1"></div> : <p className="text-lg sm:text-xl font-bold">{bills.length}</p>}</div>
            <div><p className="text-gray-400 text-xs sm:text-sm">Average Bill Size</p>{isFetching ? <div className="h-7 w-20 bg-white/10 animate-pulse rounded mx-auto mt-1"></div> : <p className="text-lg sm:text-xl font-bold">₨ {bills.length ? Math.round(pnl?.total_sales / bills.length).toLocaleString() : 0}</p>}</div>
          </div>
        </div>

        {/* Discount Overview */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg"><Percent className="w-5 h-5 sm:w-6 sm:h-6"/></div>
            <h3 className="text-base sm:text-lg font-semibold">Discount Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
            <div><p className="text-gray-400 text-xs sm:text-sm">Bills with Discount</p>{isFetching ? <div className="h-7 w-12 bg-white/10 animate-pulse rounded mx-auto mt-1"></div> : <p className="text-lg sm:text-xl font-bold">{discounts.length}</p>}</div>
            <div><p className="text-gray-400 text-xs sm:text-sm">Total Discount Given</p>{isFetching ? <div className="h-7 w-20 bg-white/10 animate-pulse rounded mx-auto mt-1"></div> : <p className="text-lg sm:text-xl font-bold text-yellow-500">₨ {discounts.reduce((sum: number, b: any) => sum + (Number(b.discount_amount) || 0), 0).toLocaleString()}</p>}</div>
          </div>
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold mt-8 sm:mt-10 border-b border-[var(--color-border)] pb-2">Recent Activity & Udhar</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-hidden flex flex-col h-96">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-[var(--color-gold)]">Recent Customers</h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <div className="space-y-3">
              {isFetching ? (
                Array.from({length: 5}).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                    <div><div className="h-4 w-24 bg-white/10 animate-pulse rounded mb-1"></div><div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div></div>
                    <div><div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div></div>
                  </div>
                ))
              ) : recentCustomers.length > 0 ? recentCustomers.map((c: any) => (
                <div key={c.id} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.mobile || 'No Phone'}</p>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              )) : <p className="text-sm text-gray-500">No customers found.</p>}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 overflow-hidden flex flex-col h-96">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-[var(--color-gold)]">Recent Bills</h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <div className="space-y-3">
              {isFetching ? (
                Array.from({length: 5}).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                    <div><div className="h-4 w-20 bg-white/10 animate-pulse rounded mb-1"></div><div className="h-3 w-24 bg-white/10 animate-pulse rounded"></div></div>
                    <div className="text-right"><div className="h-4 w-16 bg-white/10 animate-pulse rounded mb-1 ml-auto"></div><div className="h-3 w-16 bg-white/10 animate-pulse rounded ml-auto"></div></div>
                  </div>
                ))
              ) : recentBills.length > 0 ? recentBills.map((b: any) => (
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
              )) : <p className="text-sm text-gray-500">No bills found.</p>}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-panel)] border border-orange-500/30 rounded-xl p-4 sm:p-6 overflow-hidden flex flex-col h-96 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-orange-500 flex items-center gap-2"><Activity size={18}/> Top Pending Udhar</h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <div className="space-y-3">
              {isFetching ? (
                Array.from({length: 5}).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                    <div><div className="h-4 w-24 bg-white/10 animate-pulse rounded mb-1"></div><div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div></div>
                    <div className="text-right"><div className="h-4 w-20 bg-white/10 animate-pulse rounded ml-auto"></div></div>
                  </div>
                ))
              ) : topPendingUdhar.length > 0 ? topPendingUdhar.map((c: any) => (
                <div key={c.id} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.mobile || 'No Phone'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">₨ {c.pending_balance.toLocaleString()}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-500">No pending udhar found.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Charts */}
      <h2 className="text-lg sm:text-xl font-bold mt-8 sm:mt-10 border-b border-[var(--color-border)] pb-2">Analytics Visualizations</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Sales Trend (Line Chart) */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 h-96">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Monthly Sales Trend</h3>
          <div className="h-full pb-8">
            {isFetching ? <div className="w-full h-full bg-white/5 animate-pulse rounded-lg"></div> : 
            <Line 
              data={{
                labels: sales?.monthly?.map((m: any) => m.label) || [],
                datasets: [
                  {
                    label: 'Collected (₨)',
                    data: sales?.monthly?.map((m: any) => m.collected) || [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    tension: 0.4,
                    fill: true
                  },
                  {
                    label: 'Pending Udhar (₨)',
                    data: sales?.monthly?.map((m: any) => m.pending) || [],
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    tension: 0.4,
                    fill: true
                  }
                ]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' as const } } }}
            />}
          </div>
        </div>

        {/* Expenses Pie Chart */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 h-96">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Expenses by Category</h3>
          <div className="h-full pb-8 flex justify-center">
            {isFetching ? <div className="w-full h-full aspect-square bg-white/5 animate-pulse rounded-full"></div> : 
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
            />}
          </div>
        </div>

        {/* Employee Revenue Bar Chart */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 h-96">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Revenue by Employee</h3>
          <div className="h-full pb-8">
            {isFetching ? <div className="w-full h-full bg-white/5 animate-pulse rounded-lg"></div> : 
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
            />}
          </div>
        </div>

        {/* Top Inventory Bar Chart */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 h-96">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Top Consumed Inventory</h3>
          <div className="h-full pb-8">
            {isFetching ? <div className="w-full h-full bg-white/5 animate-pulse rounded-lg"></div> : 
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
            />}
          </div>
        </div>

      </div>

    </div>
  );
}

function StatCard({ title, value, icon, trend, isFetching }: { title: string, value: string | number, icon: React.ReactNode, trend?: string, isFetching?: boolean }) {
  return (
    <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 flex flex-col justify-between group hover:border-[var(--color-gold)] transition-colors">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="text-gray-400 font-medium text-xs sm:text-sm md:text-base">{title}</h3>
        <div className="text-[var(--color-gold)] p-1.5 sm:p-2 rounded-lg bg-[var(--color-gold)]/10 group-hover:bg-[var(--color-gold)] group-hover:text-black transition-colors">
          {icon}
        </div>
      </div>
      <div>
        {isFetching ? <div className="h-8 w-24 bg-white/10 animate-pulse rounded"></div> : <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{value}</div>}
        {trend && (
          <div className={`text-xs sm:text-sm mt-2 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {trend} from yesterday
          </div>
        )}
      </div>
    </div>
  );
}
