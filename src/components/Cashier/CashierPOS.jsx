import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { 
  CreditCard, 
  QrCode, 
  Wallet, 
  Banknote, 
  Printer, 
  RefreshCw, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import ReceiptModal from '../Common/ReceiptModal';

export default function CashierPOS() {
  const { 
    orders, 
    processPayment, 
    retryPayment, 
    cancelOrder
  } = useRestaurant();

  // Active selected order for the billing terminal
  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    const ready = orders.find(o => o.status === 'ORDER_READY' && o.paymentStatus !== 'PAID');
    return ready ? ready.id : (orders[0]?.id || null);
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cashTendered, setCashTendered] = useState('');
  const [simulateSuccessMode, setSimulateSuccessMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Compute Cashier Analytics
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'ORDER_READY' && o.paymentStatus !== 'PAID');
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.total, 0);

  // Cash change calculation
  const cashGiven = parseFloat(cashTendered) || 0;
  const changeDue = selectedOrder ? Math.max(0, cashGiven - selectedOrder.total) : 0;

  const handleProcessPayment = () => {
    if (!selectedOrder) return;
    setIsProcessing(true);

    setTimeout(() => {
      const result = processPayment(selectedOrder.id, paymentMethod, simulateSuccessMode);
      setIsProcessing(false);

      if (result.success) {
        setViewingReceiptOrder(orders.find(o => o.id === selectedOrder.id));
        setShowReceiptModal(true);
      }
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-slate-100">
      
      {/* Cashier Banner (Vibrant Professional) */}
      <div className="glass-panel p-6 sm:p-8 mb-7 bg-gradient-to-r from-blue-500/15 via-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl flex justify-between items-center flex-wrap gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30">
            <CreditCard size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-blue text-[10px]">
                Swimlane 4: Cashier / POS (@staff.com)
              </span>
              <span className="text-xs text-blue-300 font-mono">Terminal Register</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              POS Billing & Cashier Desk
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Process payments (Cash / Card / UPI / Wallet) ➔ Validate Transaction ➔ Generate Official Tax Receipts
            </p>
          </div>
        </div>

        {/* Revenue Analytics Cards */}
        <div className="flex gap-3">
          <div className="p-3 sm:px-5 bg-slate-950/80 rounded-2xl border border-emerald-500/30 text-center">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ₹{totalRevenue.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Settled Revenue</div>
          </div>
          <div className="p-3 sm:px-5 bg-slate-950/80 rounded-2xl border border-amber-500/30 text-center">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              ₹{pendingRevenue.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Uncollected</div>
          </div>
          <div className="p-3 sm:px-5 bg-slate-950/80 rounded-2xl border border-blue-500/30 text-center">
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
              {completedOrders.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Receipts Issued</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Billing Queue on Left, Active Register on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
        
        {/* Left Column: Orders List */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Billing Queue</h3>
            <span className="badge badge-amber text-[10px]">{orders.length} Orders</span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-1">
            {orders.map(o => {
              const isSelected = selectedOrderId === o.id;
              const isReady = o.status === 'ORDER_READY';
              const isPaid = o.paymentStatus === 'PAID';
              const isFailed = o.paymentStatus === 'FAILED';

              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-blue-500/15 border-blue-500 shadow-md shadow-blue-500/10' 
                      : 'bg-slate-950/60 hover:bg-slate-900 border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-white font-mono text-sm">
                      #{o.id}
                    </span>
                    <span className={`badge ${
                      isPaid 
                        ? 'badge-emerald' 
                        : isFailed 
                        ? 'badge-rose' 
                        : isReady 
                        ? 'badge-amber' 
                        : 'badge-blue'
                    } text-[9px]`}>
                      {isPaid ? 'PAID' : isFailed ? 'FAILED' : isReady ? 'BILL READY' : o.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>{o.orderType === 'dine-in' ? `Table ${o.tableNumber}` : 'Delivery'} • {o.customerName}</span>
                    <strong className="text-amber-400 font-mono">₹{o.total.toFixed(2)}</strong>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {o.items.length} items
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Cashier Terminal */}
        {selectedOrder ? (
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/15">
            
            {/* Terminal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-5">
              <div>
                <span className="badge badge-blue mb-2 text-[10px]">
                  Register Terminal
                </span>
                <h2 className="text-2xl font-extrabold text-white font-mono">
                  Order #{selectedOrder.id}
                </h2>
                <div className="text-xs text-slate-300 mt-1">
                  Customer: <strong className="text-white">{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">
                  {selectedOrder.orderType === 'dine-in' ? `Table ${selectedOrder.tableNumber}` : 'Delivery Service'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Created: {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                </div>
                {selectedOrder.paymentStatus === 'PAID' && (
                  <div className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                    Receipt #{selectedOrder.receiptNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Bill Line Items Table */}
            <div className="mb-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono">
                Itemized Bill Summary
              </div>

              <div className="bg-slate-950/80 rounded-2xl overflow-hidden border border-white/10">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-white/10 font-mono text-[11px]">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="p-3">
                          <span className="text-white font-semibold">{item.name}</span>
                          {item.notes && <span className="text-amber-400 text-[10px] block mt-0.5 font-mono">Note: {item.notes}</span>}
                        </td>
                        <td className="p-3 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">₹{item.price.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-amber-400 font-bold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bill Computation Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              
              {/* Payment Methods & Simulator */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono">
                  Settlement Method
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { id: 'Cash', label: 'Cash Currency', icon: Banknote, color: 'text-emerald-400' },
                    { id: 'Card', label: 'Credit/Debit Card', icon: CreditCard, color: 'text-blue-400' },
                    { id: 'UPI', label: 'UPI / QR Scan', icon: QrCode, color: 'text-purple-400' },
                    { id: 'Wallet', label: 'Digital Wallet', icon: Wallet, color: 'text-amber-400' }
                  ].map(m => {
                    const Icon = m.icon;
                    const isSel = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        disabled={selectedOrder.paymentStatus === 'PAID'}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border ${
                          isSel 
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm' 
                            : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon size={16} className={m.color} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Method-Specific Controls */}
                {paymentMethod === 'Cash' && selectedOrder.paymentStatus !== 'PAID' && (
                  <div className="bg-slate-950 p-3 rounded-xl mb-4 border border-white/10">
                    <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                      Cash Tendered by Customer (₹):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-white font-mono text-sm mb-2 focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Change Due:</span>
                      <strong className="text-emerald-400">₹{changeDue.toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="flex items-center gap-3.5 bg-slate-950 p-3 rounded-xl mb-4 border border-white/10">
                    <div className="bg-white p-1.5 rounded-lg shadow">
                      <QrCode size={38} className="text-slate-950" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        Scan & Pay via UPI / PhonePe / GPay
                      </div>
                      <div className="text-[11px] text-purple-400 font-mono">
                        kokankinara@bank.upi
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagram Branch Simulator Switch */}
                {selectedOrder.paymentStatus !== 'PAID' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <div className="text-xs font-bold text-white font-mono">
                          Activity Branch Test:
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Payment successful? [Yes / No]
                        </div>
                      </div>
                      <button
                        onClick={() => setSimulateSuccessMode(!simulateSuccessMode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          simulateSuccessMode 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {simulateSuccessMode ? 'Branch: YES (Success)' : 'Branch: NO (Failure)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals & Grand Settlement Card */}
              <div className="bg-slate-950/80 p-5 rounded-2xl flex flex-col justify-between border border-white/10">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
                    Settlement Calculation
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-mono">₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>GST / Service Tax (5%)</span>
                      <span className="font-mono">₹{selectedOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Discount Promo ({selectedOrder.discountCode})</span>
                        <span className="font-mono">-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-black text-xl border-t border-white/15 pt-3 mt-2">
                      <span>Total Due</span>
                      <span className="font-mono text-amber-400">
                        ₹{selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status-Driven Terminal Actions */}
                <div className="mt-5">
                  {selectedOrder.paymentStatus === 'PAID' ? (
                    <div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center text-emerald-300 font-bold text-xs mb-2.5 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>Order Completed & Paid</span>
                      </div>
                      <button
                        onClick={() => {
                          setViewingReceiptOrder(selectedOrder);
                          setShowReceiptModal(true);
                        }}
                        className="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer"
                      >
                        <Printer size={15} /> Print Official Receipt
                      </button>
                    </div>
                  ) : selectedOrder.paymentStatus === 'FAILED' ? (
                    <div>
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-3">
                        <strong>Payment Failed:</strong> Customer can retry or cancel order.
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => retryPayment(selectedOrder.id)}
                          className="btn-primary flex-1 text-xs py-2 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw size={13} /> Retry Payment
                        </button>
                        <button
                          onClick={() => cancelOrder(selectedOrder.id, 'Cashier cancelled order after failed payment')}
                          className="btn-danger text-xs py-2 cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      className="btn-success w-full py-3.5 text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing Transaction...' : `Confirm & Charge $${selectedOrder.total.toFixed(2)}`}
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Audit Log for this Order */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Order Lifecycle Trace
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl text-xs space-y-1.5 border border-white/10 font-mono text-slate-300">
                {selectedOrder.logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-amber-400">[{log.time}]</span>
                    <span>{log.action}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-16 px-4 text-center glass-panel border border-white/15 rounded-3xl">
            <FileText size={44} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Order Selected</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Select an order from the billing queue on the left to review its bill and process payment.</p>
          </div>
        )}

      </div>

      {/* Tax Receipt Modal */}
      {showReceiptModal && viewingReceiptOrder && (
        <ReceiptModal
          order={viewingReceiptOrder}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
}
