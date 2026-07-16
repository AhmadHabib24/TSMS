'use client';
import { useEffect, useState, use } from 'react';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import ReceiptPrinter from '@/components/ReceiptPrinter';
import Link from 'next/link';

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  
  const [bill, setBill] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [billRes, settingsRes] = await Promise.all([
          api.get(`/bills/${unwrappedParams.id}`),
          api.get('/print-settings')
        ]);
        setBill(billRes.data);
        setSettings(settingsRes.data);
      } catch (err) {
        console.error("Failed to load data for receipt");
      }
      setLoading(false);
    };
    fetchAll();
  }, [unwrappedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--color-background)]">
        <Loader2 className="animate-spin text-[var(--color-gold)]" size={48} />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[var(--color-background)] text-white">
        <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
        <Link href="/billing" className="text-[var(--color-gold)] hover:underline">Return to Billing</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-10 min-h-screen bg-[var(--color-background)] relative z-50">
      
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden px-4">
        <Link href="/billing" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Billing
        </Link>
        <button 
          onClick={handlePrint}
          className="bg-[var(--color-gold)] text-black px-6 py-2 rounded-lg font-bold hover:bg-[var(--color-gold-hover)] transition-colors shadow-lg flex items-center gap-2"
        >
          <Printer size={20} /> Print Receipt
        </button>
      </div>

      {/* Screen Preview Container (Hidden during print) */}
      <div className="print:hidden w-full max-w-4xl bg-gray-900/50 p-8 rounded-xl border border-[var(--color-border)] flex justify-center overflow-x-auto">
        <div className="shadow-2xl bg-white">
           <ReceiptPrinter bill={bill} settings={settings} />
        </div>
      </div>

      {/* Actual Print Elements */}
      <div className="hidden print:block w-full">
         <ReceiptPrinter bill={bill} settings={settings} />
      </div>

      {/* CSS specific for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible !important;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          @page {
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
