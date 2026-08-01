'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check, Printer, UserPlus, CreditCard, Banknote, Smartphone, X, Clock, Scissors, Sparkles, Droplet, Wind, Zap, Star, Heart, Smile, Crown, Flower, Moon, Sun, Cloud, Flame, Gem, CircleDot, Activity, Layers, Tag } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const AVAILABLE_ICONS: Record<string, any> = {
  Scissors, Sparkles, Droplet, Wind, Zap, Star, Heart, Smile, Crown, Flower, Moon, Sun, Cloud, Flame, Gem, CircleDot, Activity
};

export default function QuickBilling() {
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState<number | ''>('');
  const [discountReason, setDiscountReason] = useState('');
  
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [upfrontPaymentMethod, setUpfrontPaymentMethod] = useState('Cash');

  const [search, setSearch] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');

  const [savedBill, setSavedBill] = useState<any>(null);
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');
  
  const [mainTab, setMainTab] = useState<'services' | 'deals' | 'packages'>('services');
  const [subTab, setSubTab] = useState<number | 'all' | 'uncategorized' | null>(null);
  
  // Fetch live data from Laravel API
  useEffect(() => {
    api.get('/customers').then(res => setCustomers(res.data)).catch(err => console.warn(err));
    api.get('/employees').then(res => setEmployees(res.data)).catch(err => console.warn(err));
    api.get('/services').then(res => setServices(res.data)).catch(err => console.warn(err));
    api.get('/service-categories').then(res => setCategories(res.data)).catch(err => console.warn(err));
    api.get('/packages').then(res => setPackages(res.data)).catch(err => console.warn(err));
    api.get('/deals').then(res => setDeals(res.data)).catch(err => console.warn(err));
  }, []);

  const subtotal = selectedServices.reduce((sum, s) => {
    let p = Number(s.price);
    if (s.is_deal && s.discount_percentage) {
      p = p - (p * (Number(s.discount_percentage) / 100));
    }
    return sum + p;
  }, 0);
  
  let promoDiscountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'percentage') {
      promoDiscountAmount = subtotal * (Number(appliedPromo.discount_value) / 100);
    } else {
      promoDiscountAmount = Number(appliedPromo.discount_value);
    }
  }

  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount - promoDiscountAmount);

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
    setPaidAmount('');
    setUpfrontPaymentMethod('Cash');
    setSavedBill(null);
    setPromoCodeInput('');
    setAppliedPromo(null);
  };

  const applyPromoCode = async () => {
    if (!promoCodeInput) return;
    try {
      const res = await api.post('/promotions/validate', { code: promoCodeInput });
      setAppliedPromo(res.data);
      toast.success('Promo code applied!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid promo code');
      setAppliedPromo(null);
    }
  };

  const removeSubService = (mainSrvId: number, isPackage: boolean, isDeal: boolean, subId: number) => {
    setSelectedServices(selectedServices.map(s => {
      if (s.id === mainSrvId && !!s.is_package === !!isPackage && !!s.is_deal === !!isDeal) {
        return {
          ...s,
          active_sub_services: s.active_sub_services.filter((sub: any) => sub.id !== subId)
        };
      }
      return s;
    }));
  };

  const handleGridKeyDown = (e: React.KeyboardEvent, index: number, total: number, columns: number) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      let nextIndex = index;
      if (e.key === 'ArrowRight') nextIndex = (index + 1) % total;
      if (e.key === 'ArrowLeft') nextIndex = (index - 1 + total) % total;
      if (e.key === 'ArrowDown') nextIndex = Math.min(index + columns, total - 1);
      if (e.key === 'ArrowUp') nextIndex = Math.max(index - columns, 0);
      
      const container = e.currentTarget.parentElement;
      if (container) {
        // Find all focusable grid items within the same container
        const items = Array.from(container.children).filter(el => (el as HTMLElement).tabIndex === 0);
        if (items[nextIndex]) {
          (items[nextIndex] as HTMLElement).focus();
        }
      }
    }
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredCustomers.map((cust: any, index: number) => (
                          <div 
                            key={cust.id} 
                            tabIndex={0}
                            onClick={() => { setSelectedCustomer(cust); setStep(2); }} 
                            onKeyDown={(e) => { 
                              if(e.key === 'Enter') { setSelectedCustomer(cust); setStep(2); }
                              else handleGridKeyDown(e, index, filteredCustomers.length, window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
                            }}
                            className="p-4 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-gold)] focus:border-[var(--color-gold)] focus:outline-none transition-colors bg-[var(--color-background)] relative"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="font-bold break-words whitespace-normal">{cust.name}</div>
                              {Number(cust.pending_balance) > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 mt-0.5">
                                  Udhar: ₨ {cust.pending_balance}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">{cust.mobile}</div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {employees.map((emp: any, index: number) => (
                    <div 
                      key={emp.id} 
                      tabIndex={0}
                      onClick={() => { setSelectedEmployee(emp); setStep(3); }} 
                      onKeyDown={(e) => { 
                        if(e.key === 'Enter') { setSelectedEmployee(emp); setStep(3); }
                        else handleGridKeyDown(e, index, employees.length, window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 2);
                      }}
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
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {/* Horizontal List of Main Categories */}
                  <div className="flex overflow-x-auto pb-3 gap-2 custom-scrollbar mb-4 border-b border-[var(--color-border)]">
                    <button
                      onClick={() => setMainTab('services')}
                      className={`whitespace-nowrap px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        mainTab === 'services' 
                          ? 'bg-[var(--color-gold)] text-black' 
                          : 'bg-transparent text-gray-400 hover:text-[var(--color-gold)]'
                      }`}
                    >
                      <Scissors size={16} /> Services
                    </button>
                    {deals.length > 0 && (
                      <button
                        onClick={() => setMainTab('deals')}
                        className={`whitespace-nowrap px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                          mainTab === 'deals'
                            ? 'bg-[var(--color-gold)] text-black' 
                            : 'bg-transparent text-gray-400 hover:text-[var(--color-gold)]'
                        }`}
                      >
                        <Tag size={16} /> Deals
                      </button>
                    )}
                    {packages.length > 0 && (
                      <button
                        onClick={() => setMainTab('packages')}
                        className={`whitespace-nowrap px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                          mainTab === 'packages'
                            ? 'bg-[var(--color-gold)] text-black' 
                            : 'bg-transparent text-gray-400 hover:text-[var(--color-gold)]'
                        }`}
                      >
                        <Layers size={16} /> Session Package
                      </button>
                    )}
                  </div>

                  {mainTab === 'services' && (
                    <div className="flex overflow-x-auto pb-3 gap-2 custom-scrollbar mb-4">
                      <button
                        onClick={() => setSubTab('all')}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full font-bold text-xs transition-all border ${
                          subTab === 'all' 
                            ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black' 
                            : 'border-[var(--color-border)] bg-[var(--color-background)] text-gray-400 hover:border-[var(--color-gold)]'
                        }`}
                      >
                        ALL
                      </button>
                      {categories.map((cat: any) => (
                        <button
                          key={cat.id}
                          onClick={() => setSubTab(cat.id)}
                          className={`whitespace-nowrap px-4 py-1.5 rounded-full font-bold text-xs transition-all border uppercase ${
                            subTab === cat.id 
                              ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black' 
                              : 'border-[var(--color-border)] bg-[var(--color-background)] text-gray-400 hover:border-[var(--color-gold)]'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                      {services.filter((s: any) => !s.service_category_id).length > 0 && (
                        <button
                          onClick={() => setSubTab('uncategorized')}
                          className={`whitespace-nowrap px-4 py-1.5 rounded-full font-bold text-xs transition-all border uppercase ${
                            subTab === 'uncategorized' 
                              ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black' 
                              : 'border-[var(--color-border)] bg-[var(--color-background)] text-gray-400 hover:border-[var(--color-gold)]'
                          }`}
                        >
                          UNCATEGORIZED
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expanded Category Services */}
                  <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-2">
                    
                    {mainTab === 'services' && subTab === null && (
                      <div className="text-center text-gray-500 italic py-12 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-background)]/50 mt-4">
                        Select a category above to view services
                      </div>
                    )}

                    {mainTab === 'services' && subTab !== null && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in duration-200">
                        {services
                          .filter((s: any) => {
                            if (subTab === 'all') return true;
                            if (subTab === 'uncategorized') return !s.service_category_id;
                            // Check direct category or subcategory
                            if (s.service_category_id === subTab) return true;
                            const parentCat = categories.find((c: any) => c.id === subTab);
                            if (parentCat && parentCat.children) {
                               return parentCat.children.some((subC: any) => subC.id === s.service_category_id);
                            }
                            return false;
                          })
                          .map((srv: any, index: number, arr: any[]) => {
                            const isSelected = !!selectedServices.find(s => s.id === srv.id);
                            const toggleSelection = () => {
                              if (isSelected) setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
                              else setSelectedServices([...selectedServices, srv]);
                            };
                            return (
                              <div 
                                key={srv.id} 
                                tabIndex={0} 
                                onClick={toggleSelection} 
                                onKeyDown={(e) => { 
                                  if(e.key === 'Enter') toggleSelection(); 
                                  else handleGridKeyDown(e, index, arr.length, window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2);
                                }} 
                                className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center focus:outline-none bg-[var(--color-panel)] shadow-sm ${
                                  isSelected 
                                    ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]' 
                                    : 'border-[var(--color-border)] hover:border-gray-500 hover:shadow-md'
                                }`}
                              >
                                <div className="mb-1 text-blue-500">
                                  {srv.icon && AVAILABLE_ICONS[srv.icon] ? React.createElement(AVAILABLE_ICONS[srv.icon], { size: 24 }) : <Scissors size={24} />}
                                </div>
                                <div className="font-bold text-[10px] sm:text-[11px] uppercase text-gray-200 mb-1 h-8 flex items-center justify-center leading-tight">
                                  {srv.name}
                                </div>
                                <div className="text-xs font-bold text-green-500">
                                  {Number(srv.price).toLocaleString()}
                                </div>
                              </div>
                            );
                        })}
                      </div>
                    )}

                    {/* Packages */}
                    {mainTab === 'packages' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                        {packages.filter((p: any) => p.is_active).map((pkg: any, index: number, arr: any[]) => {
                          const isSelected = !!selectedServices.find(s => s.is_package && s.id === pkg.id);
                          const toggleSelection = () => {
                            if (isSelected) {
                              setSelectedServices(selectedServices.filter(s => !(s.is_package && s.id === pkg.id)));
                            } else {
                              setSelectedServices([...selectedServices, { ...pkg, is_package: true, active_sub_services: pkg.services }]);
                            }
                          };
                          return (
                            <div 
                              key={`pkg-${pkg.id}`} 
                              tabIndex={0} 
                              onClick={toggleSelection} 
                              onKeyDown={(e) => { 
                                if(e.key === 'Enter') toggleSelection(); 
                                else handleGridKeyDown(e, index, arr.length, window.innerWidth >= 768 ? 3 : window.innerWidth >= 640 ? 2 : 1);
                              }} 
                              className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col justify-between focus:outline-none bg-[var(--color-panel)] ${isSelected ? 'border-[var(--color-gold)] shadow-md ring-1 ring-[var(--color-gold)]' : 'border-[var(--color-border)] hover:shadow-md'}`}
                            >
                              <div>
                                <div className="font-bold text-xs sm:text-sm flex items-center gap-2 mb-2">
                                  <Layers size={16} className="text-blue-500" />
                                  <span className="uppercase text-gray-200">{pkg.name}</span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 min-h-[30px] sm:min-h-[40px]">
                                  {pkg.services?.map((s:any)=>s.name).join(' • ')}
                                </div>
                              </div>
                              <div className={`text-xs sm:text-sm mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[var(--color-border)] flex justify-between items-center ${isSelected ? 'font-bold' : ''}`}>
                                <span className="text-[10px] sm:text-xs text-gray-500">Package Price</span>
                                <span className="text-green-500 font-bold">₨ {Number(pkg.price).toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Deals */}
                    {mainTab === 'deals' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                        {deals.filter((d: any) => d.is_active).map((deal: any, index: number, arr: any[]) => {
                          const isSelected = !!selectedServices.find(s => s.is_deal && s.id === deal.id);
                          const toggleSelection = () => {
                            if (isSelected) {
                              setSelectedServices(selectedServices.filter(s => !(s.is_deal && s.id === deal.id)));
                            } else {
                              setSelectedServices([...selectedServices, { ...deal, is_deal: true, active_sub_services: deal.services }]);
                            }
                          };
                          
                          const discountedPrice = deal.price - (deal.price * (deal.discount_percentage / 100));

                          return (
                            <div 
                              key={`deal-${deal.id}`} 
                              tabIndex={0} 
                              onClick={toggleSelection} 
                              onKeyDown={(e) => { 
                                if(e.key === 'Enter') toggleSelection(); 
                                else handleGridKeyDown(e, index, arr.length, window.innerWidth >= 768 ? 3 : window.innerWidth >= 640 ? 2 : 1);
                              }} 
                              className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col justify-between focus:outline-none bg-[var(--color-panel)] ${isSelected ? 'border-[var(--color-gold)] shadow-md ring-1 ring-[var(--color-gold)]' : 'border-[var(--color-border)] hover:shadow-md'}`}
                            >
                              <div>
                                <div className="font-bold text-xs sm:text-sm flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Tag size={16} className="text-blue-500" />
                                    <span className="uppercase text-gray-200">{deal.name}</span>
                                  </div>
                                  {deal.discount_percentage > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{deal.discount_percentage}% OFF</span>}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 min-h-[30px] sm:min-h-[40px]">
                                  {deal.services?.map((s:any)=>s.name).join(' • ')}
                                </div>
                              </div>
                              <div className="text-xs sm:text-sm mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
                                <span className="text-[10px] sm:text-xs text-gray-500">Deal Price</span>
                                <div className="text-right">
                                  {deal.discount_percentage > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-gray-500 line-through">₨ {Number(deal.price).toLocaleString()}</span>
                                      <span className="text-green-500 font-bold text-xs sm:text-sm">₨ {discountedPrice.toLocaleString()}</span>
                                    </div>
                                  ) : (
                                    <span className="text-green-500 font-bold text-xs sm:text-sm">₨ {Number(deal.price).toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                  </div>
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
              {selectedServices.map(srv => {
                let displayPrice = srv.price;
                if (srv.is_deal && srv.discount_percentage > 0) {
                  displayPrice = srv.price - (srv.price * (srv.discount_percentage / 100));
                }
                
                return (
                  <div key={srv.is_package ? `pkg-${srv.id}` : (srv.is_deal ? `deal-${srv.id}` : `srv-${srv.id}`)} className="flex flex-col text-[var(--color-foreground)] text-sm mb-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold">
                        {srv.name} 
                        {srv.is_package && <span className="text-xs text-[var(--color-gold)] ml-1 border border-[var(--color-gold)] px-1 rounded">Package</span>}
                        {srv.is_deal && <span className="text-xs text-orange-400 ml-1 border border-orange-400 px-1 rounded">Deal</span>}
                      </span>
                      <span className="text-gray-300">₨ {displayPrice}</span>
                    </div>
                    {(srv.is_package || srv.is_deal) && srv.active_sub_services && (
                      <div className="mt-2 ml-2 pl-2 border-l border-[var(--color-border)] space-y-1">
                        {srv.active_sub_services.map((sub: any) => (
                          <div key={sub.id} className="flex items-center justify-between text-xs text-gray-400 group">
                            <span className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                              {sub.name}
                            </span>
                            <button 
                              onClick={() => removeSubService(srv.id, !!srv.is_package, !!srv.is_deal, sub.id)}
                              className="text-red-500/70 hover:text-red-500 transition-colors"
                              title="Remove from package"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
                
                {/* Promo Code Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Promo Code"
                    className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded py-2 px-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-gold)] outline-none uppercase font-mono tracking-widest"
                  />
                  <button onClick={applyPromoCode} className="bg-gray-800 text-white px-4 rounded font-bold hover:bg-gray-700 transition-colors text-sm">Apply</button>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-green-500 text-sm font-bold bg-green-500/10 p-2 rounded">
                    <span>Promo: {appliedPromo.code}</span>
                    <div className="flex items-center gap-2">
                      <span>- ₨ {promoDiscountAmount.toFixed(2)}</span>
                      <button onClick={() => { setAppliedPromo(null); setPromoCodeInput(''); }} className="text-green-500 hover:text-green-400"><X size={14}/></button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-400 text-sm gap-2 sm:gap-1">
                  <span>Custom Discount</span>
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

            {paymentMethod === 'Udhar' && (
              <div className="mb-6 p-4 border border-orange-500/50 bg-orange-500/5 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="font-bold text-orange-500 text-sm uppercase tracking-wider">Partial Payment (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Amount Paying Now</label>
                    <input 
                      type="number" 
                      value={paidAmount} 
                      onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                      max={total}
                      placeholder="0" 
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded py-2 px-3 text-[var(--color-foreground)] focus:border-orange-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Payment Method</label>
                    <select 
                      value={upfrontPaymentMethod} 
                      onChange={e => setUpfrontPaymentMethod(e.target.value)} 
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded py-2 px-3 text-[var(--color-foreground)] focus:border-orange-500 outline-none appearance-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Online">Online</option>
                      <option value="Jazz Cash">Jazz Cash</option>
                      <option value="POS Meezan">POS Meezan</option>
                      <option value="UBL">UBL</option>
                    </select>
                  </div>
                </div>
                {Number(paidAmount) > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-gray-300 pt-2 border-t border-orange-500/20">
                    <span>Remaining Udhar:</span>
                    <span className="text-orange-500">₨ {total - Number(paidAmount)}</span>
                  </div>
                )}
              </div>
            )}

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
                      paid_amount: paymentMethod === 'Udhar' ? (Number(paidAmount) || 0) : total,
                      upfront_payment_method: paymentMethod === 'Udhar' ? upfrontPaymentMethod : paymentMethod,
                      discount_amount: discountAmount,
                      discount_reason: discountReason,
                      promotion_id: appliedPromo?.id,
                      promotion_code: appliedPromo?.code,
                      items: selectedServices.map(s => {
                        let price = s.price;
                        if (s.is_deal && s.discount_percentage > 0) {
                          price = s.price - (s.price * (s.discount_percentage / 100));
                        }
                        
                        if (s.is_package) {
                          return { package_id: s.id, price, package_services_json: s.active_sub_services.map((as:any) => as.name) };
                        } else if (s.is_deal) {
                          return { deal_id: s.id, price, deal_services_json: s.active_sub_services.map((as:any) => as.name) };
                        }
                        return { service_id: s.id, price: s.price };
                      })
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
