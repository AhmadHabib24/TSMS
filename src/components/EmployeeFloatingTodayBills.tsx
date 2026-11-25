'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Receipt,
  X,
  User,
  Scissors,
  Sparkles,
  Droplet,
  Crown,
  Palette,
  Banknote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

type EmployeeRow = {
  id: number;
  name: string;
  designation?: string;
  image_path?: string;
};

function formatTime(createdAt?: string) {
  if (!createdAt) return '';
  return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function iconForDesignation(designation?: string): LucideIcon {
  const d = (designation || '').toLowerCase();
  if (d.includes('barber') || d.includes('hair') || d.includes('cut') || d.includes('trim')) return Scissors;
  if (d.includes('makeup') || d.includes('bridal') || d.includes('style') || d.includes('groom')) return Sparkles;
  if (d.includes('massage') || d.includes('spa') || d.includes('facial') || d.includes('wax')) return Droplet;
  if (d.includes('nail') || d.includes('manicure') || d.includes('pedicure')) return Palette;
  if (d.includes('manager') || d.includes('admin') || d.includes('supervisor')) return Crown;
  if (d.includes('cash') || d.includes('reception')) return Banknote;
  return User;
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
  const storageBase = process.env.NEXT_PUBLIC_STORAGE_URL || '';

  return (
    <>
      <div className="fixed z-40 top-28 bottom-24 right-0 flex flex-col items-end justify-center gap-1.5 max-h-[min(520px,calc(100vh-9rem))] overflow-y-auto custom-scrollbar no-print pointer-events-none py-2">
        {employees.map((emp) => {
          const { count, total } = statsFor(emp.id);
          const isOpen = openEmployeeId === emp.id;
          const Icon = iconForDesignation(emp.designation);
          const hasActivity = count > 0;

          return (
            <button
              key={emp.id}
              type="button"
              onClick={() => setOpenEmployeeId(isOpen ? null : emp.id)}
              className={`pointer-events-auto group relative flex items-center gap-2 pl-2 pr-1.5 py-2 rounded-l-2xl border-y border-l shadow-lg backdrop-blur-md transition-all min-h-[46px] ${
                isOpen
                  ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] w-[52px]'
                  : hasActivity
                    ? 'bg-[var(--color-panel)]/95 border-[var(--color-gold)]/60 hover:border-[var(--color-gold)] w-[46px] hover:w-[52px]'
                    : 'bg-[var(--color-panel)]/85 border-[var(--color-border)] hover:border-gray-500 w-[42px] hover:w-[48px]'
              }`}
              title={`${emp.name}${hasActivity ? ` — ${count} bill(s), ₨ ${total.toLocaleString()}` : ' — no bills today'}`}
              aria-label={emp.name}
            >
              <span
                className={`flex shrink-0 items-center justify-center w-9 h-9 rounded-full border overflow-hidden ${
                  isOpen ? 'bg-black/10 border-black/20' : hasActivity ? 'bg-[var(--color-gold)]/15 border-[var(--color-gold)]/40' : 'bg-[var(--color-background)] border-[var(--color-border)]'
                }`}
              >
                {emp.image_path ? (
                  <img
                    src={`${storageBase}/${emp.image_path}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon
                    size={18}
                    className={isOpen ? 'text-black' : hasActivity ? 'text-[var(--color-gold)]' : 'text-gray-500'}
                  />
                )}
              </span>

              {hasActivity && (
                <span
                  className={`absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                    isOpen ? 'bg-black text-[var(--color-gold)]' : 'bg-[var(--color-gold)] text-black'
                  }`}
                >
                  {count}
                </span>
              )}

              {/* Slide-out name on hover (desktop) */}
              <span
                className={`hidden lg:block absolute right-full mr-2 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 border ${
                  isOpen
                    ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)]'
                    : 'bg-[var(--color-panel)] text-[var(--color-foreground)] border-[var(--color-border)]'
                }`}
              >
                {emp.name.split(' ')[0]}
              </span>
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
              <div className="flex items-center gap-3 min-w-0">
                {(() => {
                  const Icon = iconForDesignation(openEmployee.designation);
                  return openEmployee.image_path ? (
                    <img
                      src={`${storageBase}/${openEmployee.image_path}`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-gold)] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40 flex items-center justify-center shrink-0">
                      <Icon size={22} className="text-[var(--color-gold)]" />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{openEmployee.name}</h3>
                  <p className="text-xs text-[var(--color-gold)] uppercase tracking-widest">
                    {openEmployee.designation || 'Staff'} · Today
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenEmployeeId(null)}
                className="p-2 rounded-lg border border-[var(--color-border)] text-gray-400 hover:text-white shrink-0"
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