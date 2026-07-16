'use client';
import { useState, useEffect } from 'react';
import { FileText, Trophy, TrendingUp, TrendingDown, Users, DollarSign, Activity, Image as ImageIcon, Calendar, PieChart, Package, AlertTriangle } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'staff' | 'bills' | 'pnl' | 'inventory' | 'discounts'>('pnl');
  
  // Data States
  const [bills, setBills] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [pnlReport, setPnlReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [discountReport, setDiscountReport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sales Date Filters
  const [dateFilter, setDateFilter] = useState('month'); // today, yesterday, week, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch logic
  useEffect(() => {
    setIsLoading(true);
    if (activeTab === 'bills') {
      api.get('/bills').then(res => {
        setBills(res.data);
        setIsLoading(false);
      });
    } else if (activeTab === 'staff') {
      api.get('/reports/employee-performance').then(res => {
        setStaffPerformance(res.data);
        setIsLoading(false);
      });
    } else if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'pnl') {
      fetchPnlReport();
    } else if (activeTab === 'inventory') {
      fetchInventoryReport();
    } else if (activeTab === 'discounts') {
      fetchDiscountReport();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'sales' || activeTab === 'pnl' || activeTab === 'inventory' || activeTab === 'discounts') {
      if (dateFilter !== 'custom') {
        calculateDatesFromFilter(dateFilter);
      }
    }
  }, [dateFilter]);

  // When start or end date changes (and filter is custom or just set), fetch report
  useEffect(() => {
    if ((activeTab === 'sales' || activeTab === 'pnl' || activeTab === 'inventory' || activeTab === 'discounts') && startDate && endDate) {
      if (activeTab === 'sales') fetchSalesReport();
      if (activeTab === 'pnl') fetchPnlReport();
      if (activeTab === 'inventory') fetchInventoryReport();
      if (activeTab === 'discounts') fetchDiscountReport();
    }
  }, [startDate, endDate]);

  const calculateDatesFromFilter = (filter: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (filter === 'today') {
      // both start and end are today
    } else if (filter === 'yesterday') {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    } else if (filter === 'week') {
      start.setDate(today.getDate() - today.getDay()); // Sunday
    } else if (filter === 'month') {
      start.setDate(1); // 1st of month
    } else if (filter === 'all') {
      start.setFullYear(2000, 0, 1);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const fetchSalesReport = () => {
    setIsLoading(true);
    let url = '/reports/sales-report';
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    api.get(url).then(res => {
      setSalesReport(res.data);
      setIsLoading(false);
    });
  };

  const fetchPnlReport = () => {
    setIsLoading(true);
    let url = '/reports/pnl-report';
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    api.get(url).then(res => {
      setPnlReport(res.data);
      setIsLoading(false);
    });
  };

  const fetchInventoryReport = () => {
    setIsLoading(true);
    let url = '/reports/inventory-report';
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    api.get(url).then(res => {
      setInventoryReport(res.data);
      setIsLoading(false);
    });
  };

  const fetchDiscountReport = () => {
    setIsLoading(true);
    let url = '/reports/discount-report';
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    api.get(url).then(res => {
      setDiscountReport(res.data);
      setIsLoading(false);
    });
  };

  // Chart Options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#d1d5db',
        bodyColor: '#eab308',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' }, beginAtZero: true },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#9ca3af', font: { family: 'inherit', size: 12 } } },
    },
    cutout: '70%',
  };

  // Prepare Chart Data
  const dailyChartData = {
    labels: salesReport?.daily?.map((d: any) => d.label) || [],
    datasets: [{
      label: 'Daily Revenue',
      data: salesReport?.daily?.map((d: any) => d.value) || [],
      borderColor: '#3b82f6', // Blue Line
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }]
  };

  const monthlyChartData = {
    labels: salesReport?.monthly?.map((d: any) => d.label) || [],
    datasets: [{
      label: 'Monthly Revenue',
      data: salesReport?.monthly?.map((d: any) => d.value) || [],
      backgroundColor: '#eab308', // Gold Bar
      borderRadius: 6,
      borderWidth: 0,
    }]
  };

  const yearlyChartData = {
    labels: salesReport?.yearly?.map((d: any) => d.label) || [],
    datasets: [{
      label: 'Yearly Revenue',
      data: salesReport?.yearly?.map((d: any) => d.value) || [],
      borderColor: '#10b981', // Green Area
      backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green gradient effect
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }]
  };

  const expensesDoughnutData = {
    labels: pnlReport?.expenses_by_category?.map((c: any) => c.label) || [],
    datasets: [{
      data: pnlReport?.expenses_by_category?.map((c: any) => c.value) || [],
      backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3 shrink-0"><FileText className="text-[var(--color-gold)]" size={32} /> Reports & Analytics</h1>
        
        <div className="flex bg-[var(--color-background)] border border-[var(--color-border)] p-1 rounded-lg overflow-x-auto w-full xl:w-auto shrink-0">
          <button onClick={() => setActiveTab('pnl')} className={`px-4 xl:px-6 py-2 rounded-md font-bold transition-all whitespace-nowrap ${activeTab === 'pnl' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            Profit & Loss
          </button>
          <button onClick={() => setActiveTab('sales')} className={`px-4 xl:px-6 py-2 rounded-md font-bold transition-all whitespace-nowrap ${activeTab === 'sales' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            Sales Report
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`px-4 xl:px-6 py-2 rounded-md font-bold transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            Inventory
          </button>
          <button onClick={() => setActiveTab('staff')} className={`px-4 xl:px-6 py-2 rounded-md font-bold transition-all whitespace-nowrap ${activeTab === 'staff' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            Staff Performance
          </button>
          <button onClick={() => setActiveTab('bills')} className={`px-4 xl:px-6 py-2 rounded-md font-bold transition-all whitespace-nowrap ${activeTab === 'bills' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            Recent Bills
          </button>
          <button onClick={() => setActiveTab('discounts')} className={`px-4 xl:px-6 py-2 rounded-md font-bold transition-all whitespace-nowrap ${activeTab === 'discounts' ? 'bg-[var(--color-gold)] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            Discounts
          </button>
        </div>
      </div>

      {(activeTab === 'sales' || activeTab === 'pnl' || activeTab === 'inventory' || activeTab === 'discounts') && (
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center animate-in fade-in duration-500">
          <div className="flex flex-wrap gap-2">
            {['today', 'yesterday', 'week', 'month', 'all'].map(f => (
              <button key={f} onClick={() => setDateFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${dateFilter === f ? 'bg-white text-black' : 'bg-black/30 text-gray-400 border border-[var(--color-border)] hover:border-white'}`}>
                {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'all' ? 'All Time' : f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="bg-black/30 border border-[var(--color-border)] rounded-lg px-4 py-2 flex items-center gap-2">
              <Calendar size={16} className="text-[var(--color-gold)]"/>
              <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDateFilter('custom'); }} className="bg-transparent text-sm text-white outline-none" />
            </div>
            <span className="text-gray-500 font-bold">TO</span>
            <div className="bg-black/30 border border-[var(--color-border)] rounded-lg px-4 py-2 flex items-center gap-2">
              <Calendar size={16} className="text-[var(--color-gold)]"/>
              <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setDateFilter('custom'); }} className="bg-transparent text-sm text-white outline-none" />
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div></div>
      ) : activeTab === 'pnl' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-panel)] border border-green-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(16,185,129,0.05)] relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
              <div className="text-green-500 font-bold uppercase tracking-widest text-xs mb-1">Total Income</div>
              <div className="text-3xl font-black text-white mb-2">₨ {pnlReport?.total_income || 0}</div>
              <div className="text-xs text-gray-400">Sales: ₨ {pnlReport?.total_sales || 0} <br/> Manual: ₨ {pnlReport?.total_manual_income || 0}</div>
            </div>

            <div className="bg-[var(--color-panel)] border border-red-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(239,68,68,0.05)] relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingDown size={120} /></div>
              <div className="text-red-500 font-bold uppercase tracking-widest text-xs mb-1">Total Expenses</div>
              <div className="text-3xl font-black text-white mb-2">₨ {pnlReport?.total_expenses || 0}</div>
              <div className="text-xs text-gray-400">Across {pnlReport?.expenses_by_category?.length || 0} categories</div>
            </div>

            <div className={`bg-gradient-to-br ${(pnlReport?.net_profit || 0) >= 0 ? 'from-green-500/20 to-teal-500/5 border-green-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'from-red-500/20 to-orange-500/5 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]'} border rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className={`font-bold uppercase tracking-widest text-xs mb-1 ${(pnlReport?.net_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>Net Profit</div>
                  <div className="text-4xl font-black text-white">₨ {pnlReport?.net_profit || 0}</div>
                </div>
                <DollarSign size={32} className={(pnlReport?.net_profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'} />
              </div>
              <div className="text-sm text-gray-300">Total Income minus Total Expenses</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-[400px]">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><PieChart size={18} className="text-[var(--color-gold)]"/> Expense Breakdown</h3>
              {pnlReport?.expenses_by_category?.length > 0 ? (
                <div className="h-[280px]">
                  <Doughnut data={expensesDoughnutData} options={doughnutOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-500">No expenses recorded for this period.</div>
              )}
            </div>
          </div>
        </div>

      ) : activeTab === 'sales' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-gradient-to-br from-[var(--color-panel)] to-black border border-[var(--color-gold)] rounded-xl p-8 flex flex-col justify-center shadow-[0_0_30px_rgba(212,175,55,0.05)]">
              <div className="text-gray-400 font-bold uppercase tracking-widest mb-2 text-sm">Selected Period Revenue</div>
              <div className="text-5xl font-black text-[var(--color-gold)]">₨ {salesReport?.total_revenue || 0}</div>
              <div className="mt-4 text-sm text-gray-500">From {startDate} to {endDate}</div>
            </div>

            <div className="md:col-span-2 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-[300px]">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Daily Sales Trend (Line Chart)</h3>
              <div className="h-[220px]">
                <Line data={dailyChartData} options={commonOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-[350px]">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Monthly Sales (Bar Chart)</h3>
              <div className="h-[270px]">
                <Bar data={monthlyChartData} options={commonOptions} />
              </div>
            </div>
            
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 h-[350px]">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Yearly Sales (Area Chart)</h3>
              <div className="h-[270px]">
                <Line data={yearlyChartData} options={commonOptions} />
              </div>
            </div>
          </div>

        </div>
      ) : activeTab === 'inventory' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Package size={48} className="text-blue-500 mb-4" />
              <div className="text-4xl font-black text-white">{inventoryReport?.total_unique_items || 0}</div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Total Unique Products</div>
            </div>
            
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Activity size={48} className="text-[var(--color-gold)] mb-4" />
              <div className="text-4xl font-black text-white">{inventoryReport?.total_stock || 0}</div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Total Items in Stock</div>
            </div>

            <div className={`bg-[var(--color-panel)] rounded-xl p-6 flex flex-col items-center justify-center text-center ${inventoryReport?.low_stock_count > 0 ? 'border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border border-[var(--color-border)]'}`}>
              <AlertTriangle size={48} className={inventoryReport?.low_stock_count > 0 ? 'text-red-500 mb-4' : 'text-gray-600 mb-4'} />
              <div className={`text-4xl font-black ${inventoryReport?.low_stock_count > 0 ? 'text-red-500' : 'text-white'}`}>{inventoryReport?.low_stock_count || 0}</div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Low Stock Alerts</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><TrendingDown size={18} className="text-red-500"/> Most Consumed Items</h3>
              {inventoryReport?.top_consumed?.length > 0 ? (
                <div className="space-y-4">
                  {inventoryReport.top_consumed.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">-{item.amount_consumed} units</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">No consumption data for this period.</div>
              )}
            </div>

            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><AlertTriangle size={18} className="text-red-500"/> Critical Stock Warnings</h3>
              {inventoryReport?.low_stock_items?.length > 0 ? (
                <div className="space-y-4">
                  {inventoryReport.low_stock_items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-gray-500">Threshold: {item.low_stock_threshold}</div>
                      </div>
                      <div className="text-red-500 font-black text-xl">{item.stock_level} left</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">All inventory levels are healthy!</div>
              )}
            </div>
          </div>
        </div>

      ) : activeTab === 'staff' ? (
        // (Staff Performance component remains exactly the same)
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/5 border border-yellow-500/30 rounded-xl p-6 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-1">Top Performer</div>
                  <div className="text-2xl font-black text-white">{staffPerformance[0]?.name || '--'}</div>
                </div>
                <Trophy size={32} className="text-yellow-500" />
              </div>
              <div className="text-sm text-gray-300">Generated <span className="text-yellow-500 font-bold">₨ {staffPerformance[0]?.revenue || 0}</span> in revenue</div>
            </div>
            
            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Team Revenue</div>
                  <div className="text-2xl font-black text-white">₨ {staffPerformance.reduce((acc, curr: any) => acc + curr.revenue, 0)}</div>
                </div>
                <DollarSign size={32} className="text-[var(--color-gold)]" />
              </div>
              <div className="text-sm text-gray-400">Across {staffPerformance.reduce((acc, curr: any) => acc + curr.total_bills, 0)} total bills</div>
            </div>

            <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Customers Served</div>
                  <div className="text-2xl font-black text-white">{staffPerformance.reduce((acc, curr: any) => acc + curr.customers_served, 0)}</div>
                </div>
                <Users size={32} className="text-blue-500" />
              </div>
              <div className="text-sm text-gray-400">By the entire team</div>
            </div>
          </div>

          <h2 className="text-xl font-bold flex items-center gap-2 mt-8 mb-4"><TrendingUp className="text-[var(--color-gold)]"/> Staff Leaderboard</h2>
          
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-black/30 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="py-4 px-6 font-bold">Rank</th>
                    <th className="py-4 px-6 font-bold">Employee</th>
                    <th className="py-4 px-6 font-bold">Revenue</th>
                    <th className="py-4 px-6 font-bold">Customers Served</th>
                    <th className="py-4 px-6 font-bold">Avg. Bill</th>
                    <th className="py-4 px-6 font-bold">Top Service</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {staffPerformance.map((emp: any, index: number) => (
                    <tr key={emp.employee_id} className={`transition-colors hover:bg-[var(--color-background)] ${index === 0 ? 'bg-yellow-500/5' : ''}`}>
                      <td className="py-4 px-6">
                        {index === 0 ? <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black">1</div> : 
                         index === 1 ? <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-black font-black">2</div> :
                         index === 2 ? <div className="w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center text-white font-black">3</div> :
                         <div className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold">{index + 1}</div>}
                      </td>
                      <td className="py-4 px-6 flex items-center gap-3">
                        {emp.image_path ? (
                          <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${emp.image_path}`} alt="img" className="w-10 h-10 rounded-full object-cover border border-[var(--color-border)]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--color-background)] flex items-center justify-center text-gray-400 border border-[var(--color-border)]"><ImageIcon size={16}/></div>
                        )}
                        <div>
                          <div className={`font-bold ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>{emp.name}</div>
                          <div className="text-xs text-gray-400">{emp.designation || 'Staff'}</div>
                        </div>
                      </td>
                      <td className={`py-4 px-6 font-black ${index === 0 ? 'text-yellow-500' : 'text-[var(--color-gold)]'}`}>₨ {emp.revenue}</td>
                      <td className="py-4 px-6"><span className="bg-blue-500/10 text-blue-400 py-1 px-3 rounded-full text-sm font-bold">{emp.customers_served}</span></td>
                      <td className="py-4 px-6 text-gray-300 font-medium">₨ {emp.avg_bill}</td>
                      <td className="py-4 px-6 text-sm text-gray-400">{emp.top_service}</td>
                    </tr>
                  ))}
                  {staffPerformance.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-500">No performance data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'discounts' ? (
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-gray-400 text-sm">
                <th className="py-3">Bill #</th>
                <th className="py-3">Date</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Amount</th>
                <th className="py-3 text-yellow-500">Discount</th>
                <th className="py-3">Reason</th>
                <th className="py-3">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {discountReport.map((d: any) => (
                <tr key={d.id} className="hover:bg-[var(--color-background)]">
                  <td className="py-4 font-bold text-gray-300">#INV{String(d.id).padStart(4, '0')}</td>
                  <td className="py-4 text-gray-400 text-sm">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="py-4">{d.customer ? d.customer.name : 'Walk-in'}</td>
                  <td className="py-4 text-white">₨ {d.subtotal}</td>
                  <td className="py-4 text-yellow-500 font-bold">- ₨ {d.discount_amount}</td>
                  <td className="py-4 italic text-gray-400">{d.discount_reason || 'N/A'}</td>
                  <td className="py-4">{d.authorizedBy ? d.authorizedBy.name : '--'}</td>
                </tr>
              ))}
              {discountReport.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-500">No discounts given in this period.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left">
            <thead><tr className="border-b border-[var(--color-border)] text-gray-400"><th>Bill #</th><th>Date</th><th>Customer</th><th>Employee</th><th>Total</th><th>Method</th><th>Action</th></tr></thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {bills.map((b: any) => (
                <tr key={b.id} className="hover:bg-[var(--color-background)]">
                  <td className="py-4 font-bold text-gray-300">#INV{String(b.id).padStart(4, '0')}</td>
                  <td className="py-4 text-gray-400 text-sm">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="py-4">{b.customer ? b.customer.name : 'Walk-in'}</td>
                  <td className="py-4">{b.employee ? b.employee.name : '--'}</td>
                  <td className="py-4 text-[var(--color-gold)] font-bold">₨ {b.total}</td>
                  <td className="py-4"><span className="bg-black/30 border border-[var(--color-border)] px-2 py-1 rounded text-xs uppercase tracking-wider">{b.payment_method}</span></td>
                  <td className="py-4">
                    <Link href={`/receipt/${b.id}`} target="_blank" className="text-sm border border-[var(--color-gold)] text-[var(--color-gold)] px-3 py-1 rounded hover:bg-[var(--color-gold)] hover:text-black transition-colors">
                      View Receipt
                    </Link>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-500">No bills generated yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}