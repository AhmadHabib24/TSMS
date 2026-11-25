'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Receipt, X } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';
import { todayBillsQueryParams } from '@/lib/billQuery';

type BillRecord = {
  id: number;
  total: number | string;
  employee_id?: number;
  employee?: { id: number; name: string };
  customer?: { name: string } | null;
  created_at?: string;
  payment_method?: string;
};

type EmployeeRow = { id: number; name: string };

function formatTime(createdAt?: string) {
  if (!createdAt) return '';
  return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function EmployeeFloatingTodayBills({
  employees,
  refreshKey = 0,
}: {
  employees: EmployeeRow[];
  refreshKey?: number;
}) {
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [openEmployeeId, setOpenEmployeeId] = useState<number | null>(null);

  const fetchTodayBills = useCallback(() => {
    api
      .get(`/bills?${todayBillsQueryParams().toString()}`)
      .then((res) => setBills(res.data ?? []))
      .catch(() => setBills([]));
  }, []);

  useEffect(() => {
    fetchTodayBills();
  }, [fetchTodayBills, refreshKey]);

  const billsByEmployee = useMemo(() => {
    const map = new Map<number, BillRecord[]>();
    for (const bill of bills) {
      const empId = bill.employee_id ?? bill.employee?.id;
      if (empId == null) continue;
      const list = map.get(empId) ?? [];
      list.push(bill);
      map.set(empId, list);
    }
    for (const [id, list] of map) {
      map.set(
        id,
        [...list].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      );
    }
    return map;
  }, [bills]);

  const statsFor = (empId: number) => {
    const list = billsByEmployee.get(empId) ?? [];
    const total = list.reduce((s, b) => s + (Number(b.total) || 0), 0);
    return { count: list.length, total, bills: list };
  };

  if (!employees.length) return null;

  const openEmployee = openEmployeeId != null ? employees.find((e) => e.id === openEmployeeId) : null;
  const openStats = openEmployeeId != null ? statsFor(openEmployeeId) : null;

  return (
    <>
      <div className="fixed z-40 flex flex-col gap-2 bottom-20 left-2 sm:left-4 md:bottom-24 md:left-[max(1rem,calc(50%-42rem))] max-h-[min(420px,calc(100vh-8rem))] overflow-y-auto custom-scrollbar no-print pointer-events-none">
        {employees.map((emp) => {
          const { count, total } = statsFor(emp.id);
          const isOpen = openEmployeeId === emp.id;
          const shortName = emp.name.split(' ')[0];

          return (
            <button
              key={emp.id}
              type="button"
              onClick={() => setOpenEmployeeId(isOpen ? null : emp.id)}
              className={`pointer-events-auto text-left min-w-[140px] max-w-[200px] px-3 py-2.5 rounded-xl border shadow-lg backdrop-blur-md transition-all ${
                isOpen
                  ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] scale-[1.02]'
                  : count > 0
                    ? 'bg-[var(--color-panel)]/95 text-[var(--color-foreground)] border-[var(--color-gold)]/50 hover:border-[var(--color-gold)]'
                    : 'bg-[var(--color-panel)]/80 text-gray-400 border-[var(--color-border)] hover:border-gray-500'
              }`}
              title={`${emp.name} — today`}
            >
              <div className="font-bold text-xs uppercase truncate">{shortName}</div>
              <div className={`text-[10px] font-bold ${isOpen ? 'text-black/70' : 'text-[var(--color-gold)]'}`}>
                {count > 0 ? `${count} bill${count !== 1 ? 's' : ''} · ₨ ${total.toLocaleString()}` : 'No bills today'}
              </div>
            </button>
          );
        })}
      </div>

      {openEmployee && openStats && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print"
          onClick={() => setOpenEmployeeId(null)}
        >
          <div
            className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-4 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-bold text-lg">{openEmployee.name}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Today&apos;s bills</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenEmployeeId(null)}
                className="p-2 rounded-lg border border-[var(--color-border)] text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-[var(--color-border)] flex justify-between text-sm">
              <span className="text-gray-400">Total bills</span>
              <span className="font-bold">{openStats.count}</span>
            </div>
            <div className="p-4 border-b border-[var(--color-border)] flex justify-between text-sm">
              <span className="text-gray-400">Amount</span>
              <span className="font-bold text-[var(--color-gold)]">₨ {openStats.total.toLocaleString()}</span>
            </div>

            <ul className="overflow-y-auto custom-scrollbar divide-y divide-[var(--color-border)] flex-1">
              {openStats.bills.length === 0 ? (
                <li className="p-6 text-center text-gray-500 italic text-sm">No bills for this employee today</li>
              ) : (
                openStats.bills.map((bill) => (
                  <li key={bill.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-sm">#INV{String(bill.id).padStart(4, '0')}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {bill.customer?.name ?? 'Walk-in'}
                        {formatTime(bill.created_at) ? ` · ${formatTime(bill.created_at)}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-green-500">₨ {Number(bill.total).toLocaleString()}</span>
                      <Link
                        href={`/receipt/${bill.id}`}
                        target="_blank"
                        className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-black transition-colors"
                      >
                        <Receipt size={16} />
                      </Link>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}