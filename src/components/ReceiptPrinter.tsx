import React from 'react';

interface ReceiptPrinterProps {
  bill: any;
  settings: any;
}

export default function ReceiptPrinter({ bill, settings }: ReceiptPrinterProps) {
  if (!bill || !settings) return null;

  const isThermal1 = settings.active_template === 'thermal_1';
  const isThermal2 = settings.active_template === 'thermal_2';
  const isA4 = settings.active_template === 'a4_1';

  const logoUrl = settings.logo_path ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${settings.logo_path}` : null;

  if (isA4) {
    return (
      <div className="bg-white text-black p-8 max-w-4xl mx-auto font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* A4 Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex items-center gap-4">
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain" />}
            <div>
              <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900">{settings.salon_name || 'Salon Invoice'}</h1>
              <p className="text-gray-600 mt-1 text-sm">{settings.address}</p>
              <p className="text-gray-600 text-sm">Phone: {settings.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest mb-2">Invoice</h2>
            <div className="text-gray-900 font-bold">#INV{String(bill.id).padStart(4, '0')}</div>
            <div className="text-gray-500 text-sm">{new Date(bill.created_at).toLocaleString()}</div>
          </div>
        </div>

        {/* Customer & Staff Info */}
        <div className="flex justify-between mb-8 bg-gray-50 p-4 rounded-lg">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Billed To</div>
            <div className="font-bold text-gray-900 text-lg">{bill.customer?.name || 'Walk-in Customer'}</div>
            {bill.customer?.phone && <div className="text-gray-600 text-sm">{bill.customer.phone}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Served By</div>
            <div className="font-bold text-gray-900 text-lg">{bill.employee?.name || '--'}</div>
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-x-auto w-full custom-scrollbar">
<table className="w-full mb-8 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900 text-gray-900 uppercase text-xs tracking-wider">
              <th className="py-3 px-2">Service</th>
              <th className="py-3 px-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bill.items?.map((item: any) => (
              <React.Fragment key={item.id}>
                <tr>
                  <td className={`py-2 px-2 font-medium ${(item.package || item.deal) ? 'pt-4' : 'py-4'}`}>
                    {item.package ? `${item.package.name} (Package)` : item.deal ? `${item.deal.name} (Deal)` : (item.service?.category ? `${item.service.category.name} - ` : '')}
                    {(item.package || item.deal) ? '' : item.service?.name}
                  </td>
                  <td className={`px-2 text-right text-gray-900 ${(item.package || item.deal) ? 'pt-4 align-top' : 'py-4'}`}>₨ {item.price}</td>
                </tr>
                {item.package && item.package_services_json && item.package_services_json.map((sName: string, idx: number) => (
                  <tr key={`${item.id}-pkg-sub-${idx}`}>
                    <td className="py-1 px-4 text-xs text-gray-500">
                      • {sName}
                    </td>
                    <td></td>
                  </tr>
                ))}
                {item.deal && item.deal_services_json && item.deal_services_json.map((sName: string, idx: number) => (
                  <tr key={`${item.id}-deal-sub-${idx}`}>
                    <td className="py-1 px-4 text-xs text-gray-500">
                      • {sName}
                    </td>
                    <td></td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
</div>

        {/* Totals */}
        <div className="flex justify-end border-t-2 border-gray-900 pt-4">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₨ {bill.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount</span>
              <span>- ₨ {bill.discount_amount}</span>
            </div>
            {bill.promotion_code && (
              <div className="flex justify-between text-gray-600">
                <span>Promo ({bill.promotion_code})</span>
                <span>Applied in total</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₨ {bill.total}</span>
            </div>
          </div>
        </div>

        {bill.payment_status === 'pending' && (
          <div className="mt-6 mb-2">
            <div className="text-center font-bold text-lg text-red-600 uppercase border-2 border-red-600 p-2 rounded">
              Payment Status: Pending / Unpaid
            </div>
            {Number(bill.paid_amount) > 0 && (
              <div className="text-center mt-2 text-gray-700 font-medium">
                Paid: ₨ {bill.paid_amount} | Remaining: <span className="text-red-600 font-bold">₨ {bill.remaining_amount}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
          <p className="font-bold text-gray-900 mb-1">{settings.footer_text}</p>
          <p className="mb-6">Generated on {new Date().toLocaleString()}</p>
          <div className="text-[10px] text-gray-400 mt-4 border-t border-gray-100 pt-2">
            &copy; {new Date().getFullYear()} Designed & Developed by Tecveq | WhatsApp: +92 307 331 9555
          </div>
        </div>
      </div>
    );
  }

  if (isThermal2) {
    return (
      <div className="bg-white text-black p-4 font-mono text-sm leading-tight" style={{ width: '80mm', margin: '0' }}>
        {/* Thermal Minimalist (Left-aligned) */}
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 w-auto mb-4 object-contain" />}
        <h1 className="text-xl font-bold uppercase mb-1">{settings.salon_name || 'Invoice'}</h1>
        {settings.address && <div className="text-xs">{settings.address}</div>}
        {settings.phone && <div className="text-xs mb-4">Tel: {settings.phone}</div>}
        
        <div className="border-t border-b border-black py-2 mb-4 space-y-1">
          <div className="flex justify-between text-xs"><span>Inv:</span> <span className="font-bold">#INV{String(bill.id).padStart(4, '0')}</span></div>
          <div className="flex justify-between text-xs"><span>Date:</span> <span>{new Date(bill.created_at).toLocaleString()}</span></div>
          <div className="flex justify-between text-xs"><span>Cust:</span> <span className="font-bold">{bill.customer?.name || 'Walk-in'}</span></div>
          <div className="flex justify-between text-xs"><span>Staff:</span> <span>{bill.employee?.name || '--'}</span></div>
        </div>

        <div className="mb-4">
          <div className="font-bold text-xs uppercase border-b border-black pb-1 mb-2">Services</div>
          {bill.items?.map((item: any) => (
            <div key={item.id} className="mb-1">
              <div className="flex justify-between text-xs">
                <span>
                  {item.package ? `${item.package.name} (PKG)` : item.deal ? `${item.deal.name} (DEAL)` : (item.service?.category ? `${item.service.category.name} - ` : '')}
                  {(item.package || item.deal) ? '' : item.service?.name}
                </span>
                <span>{item.price}</span>
              </div>
              {item.package && item.package_services_json && item.package_services_json.map((sName: string, idx: number) => (
                <div key={`${item.id}-pkg-sub-${idx}`} className="text-[10px] text-gray-600 ml-2">
                  • {sName}
                </div>
              ))}
              {item.deal && item.deal_services_json && item.deal_services_json.map((sName: string, idx: number) => (
                <div key={`${item.id}-deal-sub-${idx}`} className="text-[10px] text-gray-600 ml-2">
                  • {sName}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-black pt-2 space-y-1 text-xs">
          <div className="flex justify-between"><span>Subtotal:</span> <span>{bill.subtotal}</span></div>
          <div className="flex justify-between"><span>Discount:</span> <span>{bill.discount_amount}</span></div>
          {bill.promotion_code && (
            <div className="flex justify-between text-[10px]"><span>Promo ({bill.promotion_code}):</span> <span>Applied</span></div>
          )}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black"><span>Total:</span> <span>₨ {bill.total}</span></div>
        </div>

        {bill.payment_status === 'pending' && (
          <div className="mt-2 text-center font-bold uppercase border-t border-b border-black py-1">
            ** PAYMENT PENDING **
            {Number(bill.paid_amount) > 0 && (
              <div className="text-xs mt-1">Paid: ₨ {bill.paid_amount} | Rem: ₨ {bill.remaining_amount}</div>
            )}
          </div>
        )}

        <div className="mt-8 text-xs text-center border-t border-black pt-2">
          {settings.footer_text && <div className="font-bold mb-1">{settings.footer_text}</div>}
          <div className="text-[10px] mb-4">Thank you!</div>
          <div className="text-[8px] text-gray-500 mt-2">
            &copy; {new Date().getFullYear()} Designed & Developed by Tecveq<br/>
            WhatsApp: +92 307 331 9555
          </div>
        </div>
      </div>
    );
  }

  // Default: Thermal 1 (Classic Centered)
  return (
    <div className="bg-white text-black p-4 font-mono text-sm leading-tight text-center" style={{ width: '80mm', margin: '0 auto' }}>
      {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 w-auto mx-auto mb-2 object-contain" />}
      <h1 className="text-2xl font-bold uppercase">{settings.salon_name || 'Invoice'}</h1>
      <div className="text-xs mt-1">{settings.address}</div>
      <div className="text-xs">{settings.phone}</div>
      
      <div className="border-y border-dashed border-black py-2 my-4 text-left space-y-1 text-xs">
        <div>Date: {new Date(bill.created_at).toLocaleString()}</div>
        <div>Receipt #: INV{String(bill.id).padStart(4, '0')}</div>
        <div>Customer: {bill.customer?.name || 'Walk-in'}</div>
        <div>Staff: {bill.employee?.name || '--'}</div>
      </div>

      <div className="overflow-x-auto w-full custom-scrollbar">
<table className="w-full text-left text-xs mb-4">
        <thead>
          <tr className="border-b border-black border-dashed">
            <th className="pb-1">Item</th>
            <th className="pb-1 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {bill.items?.map((item: any) => (
            <React.Fragment key={item.id}>
              <tr>
                <td className="py-1">
                  {item.package ? `${item.package.name} (PKG)` : item.deal ? `${item.deal.name} (DEAL)` : (item.service?.category ? `${item.service.category.name} - ` : '')}
                  {(item.package || item.deal) ? '' : item.service?.name}
                </td>
                <td className="py-1 text-right">{item.price}</td>
              </tr>
              {item.package && item.package_services_json && item.package_services_json.map((sName: string, idx: number) => (
                <tr key={`${item.id}-pkg-sub-${idx}`}>
                  <td className="py-0.5 text-[10px] text-gray-600 pl-2">
                    • {sName}
                  </td>
                  <td></td>
                </tr>
              ))}
              {item.deal && item.deal_services_json && item.deal_services_json.map((sName: string, idx: number) => (
                <tr key={`${item.id}-deal-sub-${idx}`}>
                  <td className="py-0.5 text-[10px] text-gray-600 pl-2">
                    • {sName}
                  </td>
                  <td></td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
</div>

      <div className="text-right text-xs space-y-1 mb-4 border-t border-dashed border-black pt-2">
        <div>Subtotal: ₨ {bill.subtotal}</div>
        <div>Discount: - ₨ {bill.discount_amount}</div>
        {bill.promotion_code && (
          <div>Promo ({bill.promotion_code}): Applied</div>
        )}
        <div className="text-xl font-bold mt-2 pt-2 border-t border-black">Total: ₨ {bill.total}</div>
      </div>

      {bill.payment_status === 'pending' && (
        <div className="text-center font-bold uppercase mt-2 pt-2 border-t border-black">
          ** PAYMENT PENDING **
          {Number(bill.paid_amount) > 0 && (
            <div className="text-xs mt-1">Paid: ₨ {bill.paid_amount} | Rem: ₨ {bill.remaining_amount}</div>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-center">
        {settings.footer_text && <div className="mb-2">{settings.footer_text}</div>}
        <div className="mb-4">*** PLEASE COME AGAIN ***</div>
        <div className="text-[8px] text-gray-500 mt-2">
          &copy; {new Date().getFullYear()} Designed & Developed by Tecveq<br/>
          WhatsApp: +92 307 331 9555
        </div>
      </div>
    </div>
  );
}
