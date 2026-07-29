'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check, Printer, UserPlus, CreditCard, Banknote, Smartphone, X, Clock, Scissors, Sparkles, Droplet, Wind, Zap, Star, Heart, Smile, Crown, Flower, Moon, Sun, Cloud, Flame, Gem, CircleDot, Activity } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const AVAILABLE_ICONS: Record<string, any> = {
  Scissors, Sparkles, Droplet, Wind, Zap, Star, Heart, Smile, Crown, Flower, Moon, Sun, Cloud, Flame, Gem, CircleDot, Activity
};

export default function QuickBilling() {
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState<number | ''>('');
  const [discountReason, setDiscountReason] = useState('');

  const [search, setSearch] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');

  const [savedBill, setSavedBill] = useState<any>(null);
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');

  // Fetch live data from Laravel API
  useEffect(() => {
    api.get('/customers').then(res => setCustomers(res.data)).catch(err => console.error(err));
    api.get('/employees').then(res => setEmployees(res.data)).catch(err => console.error(err));
    api.get('/services').then(res => setServices(res.data)).catch(err => console.error(err));
    api.get('/service-categories').then(res => setCategories(res.data)).catch(err => console.error(err));
  }, []);

  const subtotal = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const discountAmount = Number(discount) || 0;
  const total = subtotal - discountAmount;

  const filteredCustomers = customers.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.mobile && String(c.mobile).includes(search))
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', { name: newCustName, mobile: newCustMobile });
      setCustomers([res.data, ...customers] as any);
      setSelectedCustomer(res.data);
      setIsAddingCustomer(false);
      setNewCustName('');
      setNewCustMobile('');
      setStep(2);
      toast.success('Customer added!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add customer');
    }
  };

  const handlePrint = (format: 'thermal' | 'a4') => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSelectedEmployee(null);
    setSelectedServices([]);
    setPaymentMethod('Cash');
    setDiscount('');
    setDiscountReason('');
    setSavedBill(null);
  };

  return (
    <>
      {/* mx-auto */}
      <div className="max-w-6xl  space-y-4 md:space-y-6 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quick Billing</h1>
            <p className="text-sm md:text-base text-gray-400">Generate a bill in under 30 seconds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Workflow */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">

            {/* Step 1: Customer */}
            <div className={`p-4 md:p-6 rounded-xl border transition-all duration-300 ${step === 1 ? 'border-[var(--color-gold)] bg-[var(--color-panel)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-[var(--color-border)] bg-[var(--color-background)] opacity-60'}`}>
              <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors ${step === 1 ? 'bg-[var(--color-gold)] text-black' : 'bg-[var(--color-border)] text-gray-400'}`}>1</span>
                  Select Customer
                </h2>
                {step === 1 && !isAddingCustomer && (
                  <button onClick={() => setIsAddingCustomer(true)} className="text-[var(--color-gold)] hover:text-[var(--color-foreground)] flex items-center gap-1 text-sm font-bold bg-[var(--color-gold)]/10 px-3 py-1.5 rounded-lg"><UserPlus size={16} /> Add New</button>
                )}
              </div>

              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {isAddingCustomer ? (
                    <form onSubmit={handleAddCustomer} className="bg-[var(--color-background)] p-4 rounded-xl border border-[var(--color-border)] space-y-4">
                      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">New Customer</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <input required value={newCustName} onChange={e => setNewCustName(e.target.value)} type="text" placeholder="Full Name" className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-gold)] outline-none" />
                        <input required value={newCustMobile} onChange={e => setNewCustMobile(e.target.value)} type="text" placeholder="Mobile Number" className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-gold)] outline-none" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button type="submit" className="flex-1 bg-[var(--color-gold)] text-black py-2 rounded-lg font-bold hover:bg-[var(--color-gold-hover)] transition-colors text-sm sm:text-base">Save & Continue</button>
                        <button type="button" onClick={() => setIsAddingCustomer(false)} className="px-4 py-2 sm:py-0 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-panel)] text-sm sm:text-base">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input 
                          value={search} 
                          onChange={e => setSearch(e.target.value)} 
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (filteredCustomers.length > 0) {
                                setSelectedCustomer(filteredCustomers[0]);
                                setStep(2);
                              }
                            }
                          }}
                          type="text" 
                          placeholder="Search by mobile number or name..." 
                          className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg py-3 pl-10 px-4 focus:outline-none focus:border-[var(--color-gold)] transition-colors" 
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredCustomers.map((cust: any) => (
                          <div 
                            key={cust.id} 
                            tabIndex={0}
                            onClick={() => { setSelectedCustomer(cust); setStep(2); }} 
                            onKeyDown={(e) => { if(e.key === 'Enter') { setSelectedCustomer(cust); setStep(2); } }}
                            className="p-4 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-gold)] focus:border-[var(--color-gold)] focus:outline-none transition-colors bg-[var(--color-background)] relative"
                          >
                            <div className="font-bold">{cust.name}</div>
                            <div className="text-sm text-gray-400">{cust.mobile}</div>
                            {Number(cust.pending_balance) > 0 && (
                              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Udhar: ₨ {cust.pending_balance}
                              </span>
                            )}
                          </div>
                        ))}
                        {filteredCustomers.length === 0 && <div className="col-span-2 text-center text-gray-500 py-4">No customers found</div>}
                      </div>
                      <button onClick={() => { setSelectedCustomer(null); setStep(2); }} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] px-4 py-3 rounded-lg hover:bg-[var(--color-gold)] hover:text-black transition-colors mt-2 font-medium">Skip (Walk-in Customer)</button>
                    </div>
                  )}
                </div>
              )}

              {step > 1 && (
                <div className="ml-0 sm:ml-11 mt-3 sm:mt-2 text-sm sm:text-base text-gray-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="break-all">{selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.mobile})` : 'Walk-in Customer'}</span>
                  <button onClick={() => setStep(1)} className="text-[var(--color-gold)] text-sm hover:underline shrink-0">Change</button>
                </div>
              )}
            </div>

            {/* Step 2: Employee */}
            <div className={`p-4 md:p-6 rounded-xl border transition-all duration-300 ${step === 2 ? 'border-[var(--color-gold)] bg-[var(--color-panel)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-[var(--color-border)] bg-[var(--color-background)] opacity-60'}`}>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors ${step === 2 ? 'bg-[var(--color-gold)] text-black' : 'bg-[var(--color-border)] text-gray-400'}`}>2</span>
                Select Employee
              </h2>
              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {employees.map((emp: any) => (
                    <div 
                      key={emp.id} 
                      tabIndex={0}
                      onClick={() => { setSelectedEmployee(emp); setStep(3); }} 
                      onKeyDown={(e) => { if(e.key === 'Enter') { setSelectedEmployee(emp); setStep(3); } }}
                      className="p-4 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-gold)] focus:border-[var(--color-gold)] focus:outline-none transition-colors flex items-center justify-between bg-[var(--color-background)]"
                    >
                      <div>
                        <div className="font-bold">{emp.name}</div>
                        <div className="text-sm text-[var(--color-gold)]">{emp.designation || 'Staff'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {step > 2 && (
                <div className="ml-0 sm:ml-11 mt-3 sm:mt-2 text-sm sm:text-base text-gray-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span>{selectedEmployee?.name}</span>
                  <button onClick={() => setStep(2)} className="text-[var(--color-gold)] text-sm hover:underline shrink-0">Change</button>
                </div>
              )}
            </div>

            {/* Step 3: Services */}
            <div className={`p-4 md:p-6 rounded-xl border transition-all duration-300 ${step === 3 ? 'border-[var(--color-gold)] bg-[var(--color-panel)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-[var(--color-border)] bg-[var(--color-background)] opacity-60'}`}>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors ${step === 3 ? 'bg-[var(--color-gold)] text-black' : 'bg-[var(--color-border)] text-gray-400'}`}>3</span>
                Select Services
              </h2>
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat: any) => {
                    const catServices = services.filter((s: any) => s.service_category_id === cat.id);
                    const hasSub = cat.children && cat.children.length > 0;
                    if (catServices.length === 0 && !hasSub) return null;
                    
                    return (
                      <div key={cat.id} className="mb-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                        <div className="bg-black/30 p-3 font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] uppercase tracking-widest text-xs">
                          {cat.name}
                        </div>
                        <div className="p-2 space-y-2">
                          {/* Services directly under parent category */}
                          {catServices.map((srv: any) => {
                            const isSelected = !!selectedServices.find(s => s.id === srv.id);
                            const toggleSelection = () => {
                              if (isSelected) setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
                              else setSelectedServices([...selectedServices, srv]);
                            };
                            return (
                              <div key={srv.id} tabIndex={0} onClick={toggleSelection} onKeyDown={(e) => { if(e.key === 'Enter') toggleSelection(); }} className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between focus:outline-none ${isSelected ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-gold)]'}`}>
                                <div className="font-bold text-sm flex items-center gap-2">
                                  {srv.icon && AVAILABLE_ICONS[srv.icon] ? React.createElement(AVAILABLE_ICONS[srv.icon], { size: 14 }) : null}
                                  {srv.name}
                                </div>
                                <div className={`text-sm ${isSelected ? 'font-bold' : ''}`}>₨ {srv.price}</div>
                              </div>
                            );
                          })}
                          
                          {/* Sub Categories */}
                          {cat.children && cat.children.map((sub: any) => {
                            const subServices = services.filter((s: any) => s.service_category_id === sub.id);
                            if (subServices.length === 0) return null;
                            return (
                              <div key={sub.id} className="mt-2 ml-4">
                                <div className="text-xs font-bold text-gray-400 mb-2 border-b border-[var(--color-border)] pb-1">↳ {sub.name}</div>
                                <div className="space-y-2">
                                  {subServices.map((srv: any) => {
                                    const isSelected = !!selectedServices.find(s => s.id === srv.id);
                                    const toggleSelection = () => {
                                      if (isSelected) setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
                                      else setSelectedServices([...selectedServices, srv]);
                                    };
                                    return (
                                      <div key={srv.id} tabIndex={0} onClick={toggleSelection} onKeyDown={(e) => { if(e.key === 'Enter') toggleSelection(); }} className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between focus:outline-none ${isSelected ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-gold)]'}`}>
                                        <div className="font-bold text-sm flex items-center gap-2">
                                          {srv.icon && AVAILABLE_ICONS[srv.icon] ? React.createElement(AVAILABLE_ICONS[srv.icon], { size: 14 }) : null}
                                          {srv.name}
                                        </div>
                                        <div className={`text-sm ${isSelected ? 'font-bold' : ''}`}>₨ {srv.price}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Uncategorized */}
                  {services.filter((s: any) => !s.service_category_id).length > 0 && (
                     <div className="mb-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                        <div className="bg-black/30 p-3 font-bold text-gray-400 border-b border-[var(--color-border)] uppercase tracking-widest text-xs">
                          Uncategorized
                        </div>
                        <div className="p-2 space-y-2">
                          {services.filter((s: any) => !s.service_category_id).map((srv: any) => {
                            const isSelected = !!selectedServices.find(s => s.id === srv.id);
                            const toggleSelection = () => {
                              if (isSelected) setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
                              else setSelectedServices([...selectedServices, srv]);
                            };
                            return (
                              <div key={srv.id} tabIndex={0} onClick={toggleSelection} onKeyDown={(e) => { if(e.key === 'Enter') toggleSelection(); }} className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between focus:outline-none ${isSelected ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-gold)]'}`}>
                                <div className="font-bold text-sm flex items-center gap-2">
                                  {srv.icon && AVAILABLE_ICONS[srv.icon] ? React.createElement(AVAILABLE_ICONS[srv.icon], { size: 14 }) : null}
                                  {srv.name}
                                </div>
                                <div className={`text-sm ${isSelected ? 'font-bold' : ''}`}>₨ {srv.price}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Receipt Preview */}
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-4 md:p-6 h-fit relative lg:sticky top-24 shadow-2xl flex flex-col mt-4 lg:mt-0">
            <h3 className="text-base sm:text-lg font-bold text-center border-b border-[var(--color-border)] pb-4 mb-4 uppercase tracking-widest text-gray-400">Bill Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-400">Customer:</span>
                <span className="font-medium text-[var(--color-foreground)] bg-[var(--color-background)] px-3 py-1 rounded-full border border-[var(--color-border)]">{selectedCustomer ? selectedCustomer.name : 'Walk-in'}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-400">Employee:</span>
                <span className="font-medium text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-3 py-1 rounded-full">{selectedEmployee ? selectedEmployee.name : '--'}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4 border-t border-[var(--color-border)] pt-4 min-h-[100px]">
              {selectedServices.map(srv => (
                <div key={srv.id} className="flex justify-between text-[var(--color-foreground)] text-sm">
                  <span>{srv.name}</span>
                  <span className="text-gray-300">₨ {srv.price}</span>
                </div>
              ))}
              {selectedServices.length === 0 && (
                <div className="text-center text-gray-500 italic py-4">No services selected</div>
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className="border-t border-b border-[var(--color-border)] py-4 mb-6 space-y-3 sm:space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-400 text-sm gap-1">
                  <span>Subtotal</span>
                  <span className="font-bold sm:font-normal text-[var(--color-foreground)] sm:text-gray-400">₨ {subtotal}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-400 text-sm gap-2 sm:gap-1">
                  <span>Discount</span>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} placeholder="0" className="w-full sm:w-20 bg-[var(--color-background)] border border-[var(--color-border)] rounded py-2 sm:py-1 px-2 text-left sm:text-right text-[var(--color-foreground)] focus:border-[var(--color-gold)] outline-none" />
                </div>
                {discountAmount > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                      type="text"
                      value={discountReason}
                      onChange={e => setDiscountReason(e.target.value)}
                      placeholder="Reason for discount..."
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded py-2 px-3 mt-2 text-sm text-[var(--color-foreground)] focus:border-[var(--color-gold)] outline-none"
                    />
                  </div>
                )}
                <div className="flex justify-between items-center text-xl sm:text-2xl font-bold text-[var(--color-gold)] pt-3 sm:pt-2 border-t border-[var(--color-border)] mt-3 sm:mt-2">
                  <span>TOTAL</span>
                  <span>₨ {total}</span>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button onClick={() => setPaymentMethod('Cash')} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs border transition-colors ${paymentMethod === 'Cash' ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold' : 'bg-[var(--color-background)] text-gray-400 border-[var(--color-border)] hover:border-[var(--color-gold)]'}`}>
                  <Banknote size={16} /> Cash
                </button>
                <button onClick={() => setPaymentMethod('Card')} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs border transition-colors ${paymentMethod === 'Card' ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold' : 'bg-[var(--color-background)] text-gray-400 border-[var(--color-border)] hover:border-[var(--color-gold)]'}`}>
                  <CreditCard size={16} /> Card
                </button>
                <button onClick={() => setPaymentMethod('Online')} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs border transition-colors ${paymentMethod === 'Online' ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold' : 'bg-[var(--color-background)] text-gray-400 border-[var(--color-border)] hover:border-[var(--color-gold)]'}`}>
                  <Smartphone size={16} /> Online
                </button>
                <button onClick={() => setPaymentMethod('Jazz Cash')} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs border transition-colors ${paymentMethod === 'Jazz Cash' ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold' : 'bg-[var(--color-background)] text-gray-400 border-[var(--color-border)] hover:border-[var(--color-gold)]'}`}>
                  <Smartphone size={16} /> Jazz Cash
                </button>
                <button onClick={() => setPaymentMethod('POS Meezan')} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs border transition-colors ${paymentMethod === 'POS Meezan' ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold' : 'bg-[var(--color-background)] text-gray-400 border-[var(--color-border)] hover:border-[var(--color-gold)]'}`}>
                  <CreditCard size={16} /> POS Meezan
                </button>
                <button onClick={() => setPaymentMethod('UBL')} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs border transition-colors ${paymentMethod === 'UBL' ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold' : 'bg-[var(--color-background)] text-gray-400 border-[var(--color-border)] hover:border-[var(--color-gold)]'}`}>
                  <CreditCard size={16} /> UBL
                </button>
                <button onClick={() => setPaymentMethod('Udhar')} className={`col-span-2 sm:col-span-3 py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs border transition-colors ${paymentMethod === 'Udhar' ? 'bg-orange-500 text-black border-orange-500 font-bold' : 'bg-[var(--color-background)] text-gray-400 border-[var(--color-border)] hover:border-orange-500 hover:text-orange-500'}`}>
                  <Clock size={16} /> Udhar (Pending)
                </button>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <button
                disabled={selectedServices.length === 0 || !selectedEmployee}
                onClick={async () => {
                  try {
                    const payload = {
                      customer_id: selectedCustomer?.id,
                      employee_id: selectedEmployee?.id,
                      payment_method: paymentMethod.toLowerCase(),
                      payment_status: paymentMethod === 'Udhar' ? 'pending' : 'paid',
                      discount_amount: discountAmount,
                      discount_reason: discountReason,
                      items: selectedServices.map(s => ({ service_id: s.id, price: s.price }))
                    };
                    const res = await api.post('/bills', payload);
                    toast.success('Bill Saved Successfully!');

                    // Show print modal instead of resetting immediately
                    setSavedBill({
                      ...res.data,
                      customer: selectedCustomer,
                      employee: selectedEmployee,
                      services: selectedServices
                    });
                  } catch (e: any) {
                    toast.error(e.response?.data?.error || 'Failed to save bill');
                  }
                }}
                className="w-full bg-[var(--color-gold)] text-black py-4 rounded-xl font-bold text-lg hover:bg-[var(--color-gold-hover)] transition-all transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:shadow-none"
              >
                <Check className="mr-2" size={24} /> Save & Pay
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Print Options Modal */}
      {savedBill && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl w-full max-w-md p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Bill Saved Successfully!</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">Bill #INV{String(savedBill.id).padStart(4, '0')} • Total: ₨ {savedBill.total}</p>

            <div className="space-y-4">
              <button onClick={() => { window.open(`/receipt/${savedBill.id}`, '_blank'); resetForm(); }} className="w-full bg-[var(--color-gold)] text-black py-4 rounded-xl font-bold text-lg hover:bg-[var(--color-gold-hover)] transition-colors flex items-center justify-center border-2 border-transparent">
                <Printer className="mr-2" size={24} /> View & Print Receipt
              </button>
            </div>

            <button onClick={resetForm} className="mt-8 text-gray-500 hover:text-[var(--color-foreground)] underline">
              Skip & Create New Bill
            </button>
          </div>
        </div>
      )}
    </>
  );
}
