import React from 'react';
import { Printer, X, UtensilsCrossed } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono text-black"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white text-black rounded-3xl p-7 shadow-2xl relative border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Receipt Header */}
        <div className="text-center border-b-2 border-dashed border-zinc-300 pb-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-sm">
              <UtensilsCrossed size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              KOKAN KINARA
            </h2>
          </div>
          <p className="text-xs text-zinc-600 m-0">
            Artisanal Culinary Arts • GSTIN: 27AABCG1234F1Z8
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            442 Luxury Promenade, Metro Bay • Tel: +1 (800) 555-DINE
          </p>
        </div>

        {/* Invoice Info */}
        <div className="text-xs text-zinc-700 mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Tax Invoice / Receipt:</span>
            <strong className="text-black">{order.receiptNumber || 'RCP-' + order.id}</strong>
          </div>
          <div className="flex justify-between">
            <span>Order ID:</span>
            <strong className="text-black">#{order.id}</strong>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span>{new Date(order.paidAt || order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Dining Type:</span>
            <strong className="capitalize text-black">
              {order.orderType === 'dine-in' ? `Dine-In (Table ${order.tableNumber})` : 'Takeaway / Delivery'}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="text-black font-semibold">{order.customerName}</span>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t border-b border-zinc-300 py-3 mb-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-dashed border-zinc-300 text-[11px]">
                <th className="pb-1.5 font-semibold">Item Description</th>
                <th className="pb-1.5 text-center font-semibold">Qty</th>
                <th className="pb-1.5 text-right font-semibold">Price</th>
                <th className="pb-1.5 text-right font-semibold">Amt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="text-zinc-900">
                  <td className="py-1.5 pr-2 max-w-[170px] truncate">{item.name}</td>
                  <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-1.5 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="py-1.5 text-right font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financials Breakdown */}
        <div className="text-xs text-zinc-700 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST / VAT (5.00%):</span>
            <span>₹{order.taxAmount.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-zinc-800 font-semibold">
              <span>Promo Discount ({order.discountCode}):</span>
              <span>-₹{order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-black border-t-2 border-dashed border-zinc-300 pt-2 mt-1">
            <span>GRAND TOTAL:</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mt-1 text-black font-semibold">
            <span>Payment Mode:</span>
            <span>PAID via {order.paymentMethod || 'UPI / Digital'}</span>
          </div>
        </div>

        {/* Barcode & Footer */}
        <div className="text-center border-t border-dashed border-zinc-300 pt-3">
          <div className="tracking-widest text-lg font-mono text-zinc-800 mb-1 select-none">
            ||| | ||||| || |||||| | ||| |||
          </div>
          <div className="text-[10px] text-zinc-500">
            TXN-AUTH: {Math.random().toString(36).substring(2, 10).toUpperCase()} • THANK YOU FOR DINING WITH US!
          </div>
        </div>

        {/* Print / Download buttons */}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-black text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-md cursor-pointer"
          >
            <Printer size={15} /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
