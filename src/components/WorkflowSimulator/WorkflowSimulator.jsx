import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { 
  GitFork, 
  ArrowDown, 
  Play, 
  ChefHat, 
  CreditCard, 
  User, 
  Crown
} from 'lucide-react';

export default function WorkflowSimulator() {
  const { 
    orders, 
    activeOrderId, 
    setActiveOrderId, 
    startPreparingOrder, 
    markOrderReady, 
    processPayment, 
    setCurrentView
  } = useRestaurant();

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0] || null;

  // Determine current active node based on order state
  const getCurrentStepNode = (order) => {
    if (!order) return 'BROWSE_MENU';
    if (order.status === 'COMPLETED') return 'RECEIVE_CONFIRMATION';
    if (order.paymentStatus === 'FAILED') return 'PAYMENT_FAILURE_RETRY';
    if (order.status === 'ORDER_READY') return 'PROCESS_PAYMENT';
    if (order.status === 'KITCHEN_PREPARING') return 'PREPARE_FOOD';
    if (order.status === 'PLACED') return 'RECEIVE_ORDER_DETAILS';
    return 'PLACE_ORDER';
  };

  const currentNode = getCurrentStepNode(activeOrder);

  // Quick Action triggers based on diagram steps
  const handleAdvanceStep = () => {
    if (!activeOrder) return;
    if (activeOrder.status === 'PLACED') {
      startPreparingOrder(activeOrder.id);
    } else if (activeOrder.status === 'KITCHEN_PREPARING') {
      markOrderReady(activeOrder.id);
    } else if (activeOrder.status === 'ORDER_READY' && activeOrder.paymentStatus !== 'PAID') {
      processPayment(activeOrder.id, 'UPI', true);
    }
  };

  const handleSimulatePaymentFailure = () => {
    if (!activeOrder) return;
    processPayment(activeOrder.id, 'Card', false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-slate-100">
      
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 mb-7 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-slate-950 border border-amber-500/30 rounded-3xl flex justify-between items-center flex-wrap gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30">
            <GitFork size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-amber text-[10px]">Interactive Activity Diagram</span>
              <span className="badge badge-emerald text-[10px]">Live Synchronized</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Restaurant Management System — Activity Diagram Flow
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Visualizing all 4 Swimlanes (Customer, System, Kitchen Staff, Cashier) and active order tokens moving across the lifecycle.
            </p>
          </div>
        </div>

        {/* Order Selector & Controller */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase font-mono">Active Ticket:</span>
            <select
              value={activeOrderId || ''}
              onChange={(e) => setActiveOrderId(e.target.value)}
              className="bg-transparent border-none text-amber-400 font-bold text-sm outline-none cursor-pointer font-mono"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id} className="bg-slate-900 text-white">
                  #{o.id} ({o.status} - ₹{o.total.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAdvanceStep}
            className="btn-primary text-xs py-2.5 px-4 font-bold cursor-pointer"
          >
            <Play size={14} /> Advance Active Step
          </button>

          <button
            onClick={handleSimulatePaymentFailure}
            className="btn-danger text-xs py-2.5 px-3.5 font-bold cursor-pointer"
          >
            Test Failure Branch
          </button>
        </div>
      </div>

      {/* 4 SWIMLANES CONTAINER (Customer | System | Kitchen Staff | Cashier / Payment System) */}
      <div className="glass-panel p-6 overflow-x-auto border border-white/10 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[950px]">
          
          {/* ======================================================== */}
          {/* SWIMLANE 1: CUSTOMER */}
          {/* ======================================================== */}
          <div className="bg-blue-500/5 rounded-2xl border border-blue-500/25 p-4">
            <div className="text-center p-2.5 bg-blue-500/15 rounded-xl border border-blue-500/30 mb-5">
              <div className="flex items-center justify-center gap-2">
                <User size={18} className="text-blue-400" />
                <h3 className="text-sm font-bold text-blue-200">1. Customer (@gmail.com)</h3>
              </div>
            </div>

            {/* Start Node */}
            <div className="flex justify-center mb-3">
              <div className="w-5 h-5 rounded-full bg-white shadow-lg shadow-white/50" />
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Step 1: Browse menu */}
            <div 
              className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-center mb-3.5 cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => setCurrentView('customer')}
            >
              <div className="text-xs font-bold text-white">Browse menu</div>
              <div className="text-[10px] text-slate-400">Filter delicacies, dietary options</div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Step 2: Select items and add to cart */}
            <div 
              className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-center mb-3.5 cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => setCurrentView('customer')}
            >
              <div className="text-xs font-bold text-white">Select items and add to cart</div>
              <div className="text-[10px] text-slate-400">Customize quantities & chef notes</div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Step 3: Place order (select table / delivery) */}
            <div 
              className={`p-3.5 rounded-xl text-center mb-5 relative border transition-all ${
                currentNode === 'PLACE_ORDER' 
                  ? 'bg-amber-500/25 border-amber-500 shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-900/90 border-white/10'
              }`}
            >
              {currentNode === 'PLACE_ORDER' && (
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center shadow">
                  ★
                </div>
              )}
              <div className="text-xs font-extrabold text-amber-300">Place order</div>
              <div className="text-[11px] text-slate-400">(select table / delivery)</div>
              <div className="mt-1.5 text-[10px] text-blue-400 font-mono">➔ Dispatches to System lane</div>
            </div>

            {/* Step: Show error message (or suggest alternative) */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-dashed border-rose-500/40 text-center mb-10">
              <div className="text-xs font-bold text-rose-400">
                Show error message
              </div>
              <div className="text-[11px] text-rose-200">
                (or suggest alternative)
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Triggered if table occupied or item out of stock
              </div>
            </div>

            {/* Step: Retry payment or cancel order */}
            <div 
              className={`p-3.5 rounded-xl text-center mb-10 border transition-all ${
                currentNode === 'PAYMENT_FAILURE_RETRY' 
                  ? 'bg-rose-500/25 border-rose-500 shadow-lg shadow-rose-500/20' 
                  : 'bg-slate-900/90 border-white/10'
              }`}
            >
              <div className="text-xs font-bold text-rose-400">
                Retry payment or cancel order
              </div>
              <div className="text-[10px] text-slate-400">
                Branch from payment failure
              </div>
            </div>

            {/* Final Step: Receive confirmation */}
            <div 
              className={`p-3.5 rounded-xl text-center mb-4 border transition-all ${
                currentNode === 'RECEIVE_CONFIRMATION' 
                  ? 'bg-emerald-500/25 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-900/90 border-white/10'
              }`}
            >
              <div className="text-xs font-bold text-emerald-400">
                Receive confirmation
              </div>
              <div className="text-[11px] text-slate-300">
                (order completed, receipt, notification)
              </div>
            </div>

            {/* End Node */}
            <div className="flex justify-center">
              <div className="w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* SWIMLANE 2: SYSTEM */}
          {/* ======================================================== */}
          <div className="bg-purple-500/5 rounded-2xl border border-purple-500/25 p-4">
            <div className="text-center p-2.5 bg-purple-500/15 rounded-xl border border-purple-500/30 mb-20">
              <div className="flex items-center justify-center gap-2">
                <Crown size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold text-purple-200">2. Manager & Admin (@admin.com)</h3>
              </div>
            </div>

            {/* Step: Validate order (items, table, availability) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-center mb-3.5">
              <div className="text-xs font-bold text-white">Validate order</div>
              <div className="text-[10px] text-slate-400">(items, table, availability)</div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Decision Diamond: Table and items available? */}
            <div className="p-4 rounded-xl bg-purple-500/15 border-2 border-purple-500/40 text-center mb-3.5">
              <div className="text-xs font-bold text-purple-300">
                Table and items available?
              </div>
              <div className="flex justify-between text-[11px] mt-2 font-mono">
                <span className="text-rose-400 font-bold">[No] ➔ Suggest Alt</span>
                <span className="text-emerald-400 font-bold">[Yes] ➔ Proceed</span>
              </div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-emerald-400" />
            </div>

            {/* Step: Create order and save details */}
            <div 
              className={`p-3.5 rounded-xl text-center mb-10 border transition-all ${
                currentNode === 'RECEIVE_ORDER_DETAILS' 
                  ? 'bg-purple-500/25 border-purple-500 shadow-md shadow-purple-500/20' 
                  : 'bg-slate-900/90 border-white/10'
              }`}
            >
              <div className="text-xs font-bold text-white">Create order and save details</div>
              <div className="text-[10px] text-slate-400">Deduct stock, occupy table, sync Cloud</div>
            </div>

            {/* Step: Notify system (order ready) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-center mb-3.5">
              <div className="text-xs font-bold text-white">Notify system</div>
              <div className="text-[10px] text-slate-400">(order ready)</div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Step: Generate bill (calculate total, tax, discount) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-center mb-8">
              <div className="text-xs font-bold text-white">Generate bill</div>
              <div className="text-[10px] text-slate-400">(calculate total, tax, discount)</div>
            </div>

            {/* Step: Show payment failure message */}
            <div className="p-3 rounded-xl bg-rose-500/10 border border-dashed border-rose-500/30 text-center mb-5">
              <div className="text-xs text-rose-300">
                Show payment failure message
              </div>
            </div>

            {/* Step: Update order status as completed */}
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center">
              <div className="text-xs font-bold text-emerald-400">
                Update order status as completed
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* SWIMLANE 3: KITCHEN STAFF */}
          {/* ======================================================== */}
          <div className="bg-rose-500/5 rounded-2xl border border-rose-500/25 p-4">
            <div className="text-center p-2.5 bg-rose-500/15 rounded-xl border border-rose-500/30 mb-36">
              <div className="flex items-center justify-center gap-2">
                <ChefHat size={18} className="text-rose-400" />
                <h3 className="text-sm font-bold text-rose-200">3. Kitchen Staff (@staff.com)</h3>
              </div>
            </div>

            {/* Step: Receive order details */}
            <div 
              className={`p-3.5 rounded-xl text-center mb-3.5 border transition-all ${
                currentNode === 'RECEIVE_ORDER_DETAILS' 
                  ? 'bg-rose-500/25 border-rose-500 shadow-md shadow-rose-500/20' 
                  : 'bg-slate-900/90 border-white/10'
              }`}
            >
              <div className="text-xs font-bold text-white">Receive order details</div>
              <div className="text-[10px] text-slate-400">Ticket dispatched to KDS board</div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Step: Prepare food */}
            <div 
              className={`p-3.5 rounded-xl text-center mb-3.5 border transition-all ${
                currentNode === 'PREPARE_FOOD' 
                  ? 'bg-amber-500/25 border-amber-500 shadow-md shadow-amber-500/20' 
                  : 'bg-slate-900/90 border-white/10'
              }`}
            >
              <div className="text-xs font-bold text-amber-300">
                Prepare food
              </div>
              <div className="text-[10px] text-slate-400">Chefs cook items according to ticket</div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Step: Mark order as ready */}
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
              <div className="text-xs font-bold text-emerald-400">Mark order as ready</div>
              <div className="text-[10px] text-slate-400">Triggers "Notify system (order ready)"</div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* SWIMLANE 4: CASHIER / PAYMENT SYSTEM */}
          {/* ======================================================== */}
          <div className="bg-blue-500/5 rounded-2xl border border-blue-500/25 p-4">
            <div className="text-center p-2.5 bg-blue-500/15 rounded-xl border border-blue-500/30 mb-80">
              <div className="flex items-center justify-center gap-2">
                <CreditCard size={18} className="text-blue-400" />
                <h3 className="text-xs font-bold text-blue-200">4. Cashier / POS (@staff.com)</h3>
              </div>
            </div>

            {/* Step: Process payment (cash / card / UPI / wallet) */}
            <div 
              className={`p-3.5 rounded-xl text-center mb-3.5 border transition-all ${
                currentNode === 'PROCESS_PAYMENT' 
                  ? 'bg-blue-500/25 border-blue-500 shadow-md shadow-blue-500/20' 
                  : 'bg-slate-900/90 border-white/10'
              }`}
            >
              <div className="text-xs font-bold text-white">Process payment</div>
              <div className="text-[10px] text-slate-400">(cash / card / UPI / wallet)</div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-slate-500" />
            </div>

            {/* Decision Diamond: Payment successful? */}
            <div className="p-3.5 rounded-xl bg-blue-500/15 border-2 border-blue-500/40 text-center mb-3.5">
              <div className="text-xs font-bold text-blue-300">
                Payment successful?
              </div>
              <div className="flex justify-between text-[11px] mt-1.5 font-mono">
                <span className="text-rose-400 font-bold">[No] ➔ Failure msg</span>
                <span className="text-emerald-400 font-bold">[Yes] ➔ Receipt</span>
              </div>
            </div>
            <div className="flex justify-center mb-3">
              <ArrowDown size={18} className="text-emerald-400" />
            </div>

            {/* Step: Update payment status and generate receipt */}
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center">
              <div className="text-xs font-bold text-emerald-400">
                Update payment status
              </div>
              <div className="text-[10px] text-emerald-200">
                and generate receipt
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
