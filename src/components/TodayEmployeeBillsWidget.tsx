'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Receipt, RefreshCw, Users } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';

type BillRecord = {
  id: number;
  total: number | string;
  employee_id?: number;
  employee?: { id: number; name: string };
  customer?: { name: string } | null;
  created_at?: string;
  payment_method?: string;
};

type EmployeeGroup = {
  id: number;
  name: string;
  bills: BillRecord[];
  total: number;
};

function toLocalISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(createdAt?: string) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TodayEmployeeBillsWidget({ refreshKey = 0 }: { refreshKey?: number }) {
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | null>(null);

  const fetchTodayBills = useCallback(() => {
    const today = toLocalISODate(new Date());
    setLoading(true);
    api
      .get(`/bills?start_date=${today}&end_date=${today}`)
      .then((res) => setBills(res.data ?? []))
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTodayBills();
  }, [fetchTodayBills, refreshKey]);

  const groups = useMemo(() => {
    const map = new Map<number, EmployeeGroup>();
    for (const bill of bills) {
      const empId = bill.employee_id ?? bill.employee?.id;
      if (empId == null) continue;
      const name = bill.employee?.name ?? 'Staff';
      const existing = map.get(empId);
      const amount = Number(bill.total) || 0;
      if (existing) {
        existing.bills.push(bill);
        existing.total += amount;
      } else {
        map.set(empId, { id: empId, name, bills: [bill], total: amount });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [bills]);

  const grandTotal = groups.reduce((s, g) => s + g.total, 0);

  return (
    <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 shadow-xl shrink-0">
      <div className="flex items-center justify-between gap-2 mb-3 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Users size={18} className="text-[var(--color-gold)] shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 truncate">Today&apos;s Bills</h3>
        </div>
        <button
          type="button"
          onClick={fetchTodayBills}
          className="p-1.5 rounded-lg border border-[var(--color-border)] text-gray-400 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && groups.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-4 italic">No bills today yet</p>
      ) : (
        <>
          <div className="flex justify-between text-xs text-gray-400 mb-3 px-1">
            <span>{groups.length} employee{groups.length !== 1 ? 's' : ''}</span>
            <span className="text-[var(--color-gold)] font-bold">₨ {grandTotal.toLocaleString()}</span>
          </div>
          <div className="max-h-[220px] overflow-y-auto custom-scrollbar pr-1 space-y-1">
            {groups.map((group) => {
              const isOpen = expandedEmployeeId === group.id;
              return (
                <div key={group.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedEmployeeId(isOpen ? null : group.id)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-[var(--color-gold)]/5 transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {isOpen ? (
                        <ChevronDown size={16} className="text-[var(--color-gold)] shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-500 shrink-0" />
                      )}
                      <span className="font-bold text-sm truncate text-[var(--color-foreground)]">{group.name}</span>
                      <span className="text-[10px] text-gray-500 shrink-0">({group.bills.length})</span>
                    </span>
                    <span className="text-sm font-bold text-[var(--color-gold)] shrink-0">₨ {group.total.toLocaleString()}</span>
                  </button>
                  {isOpen && (
                    <ul className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                      {group.bills.map((bill) => (
                        <li key={bill.id} className="px-3 py-2 flex items-center justify-between gap-2 text-sm">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-300">{group.name}</div>
                            <div className="text-[10px] text-gray-500 truncate">
                              #{String(bill.id).padStart(4, '0')}
                              {bill.customer?.name ? ` · ${bill.customer.name}` : ''}
                              {formatTime(bill.created_at) ? ` · ${formatTime(bill.created_at)}` : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-green-500">₨ {Number(bill.total).toLocaleString()}</span>
                            <Link
                              href={`/receipt/${bill.id}`}
                              target="_blank"
                              className="p-1 rounded text-gray-400 hover:text-[var(--color-gold)]"
                              title="View receipt"
                            >
                              <Receipt size={14} />
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}