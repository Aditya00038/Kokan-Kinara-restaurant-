import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Filter,
  Bike,
  UtensilsCrossed,
  User,
  AlertCircle
} from 'lucide-react';

export default function KitchenDisplay() {
  const { 
    orders, 
    startPreparingOrder, 
    markOrderReady,
    setCurrentView
  } = useRestaurant();

  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PLACED, KITCHEN_PREPARING, ORDER_READY

  // Filter orders relevant to Kitchen
  const kitchenOrders = orders.filter(o => {
    if (o.status === 'CANCELLED') return false;
    if (statusFilter === 'ALL') {
      return ['PLACED', 'KITCHEN_PREPARING', 'ORDER_READY'].includes(o.status);
    }
    return o.status === statusFilter;
  });

  const countPlaced = orders.filter(o => o.status === 'PLACED').length;
  const countPreparing = orders.filter(o => o.status === 'KITCHEN_PREPARING').length;
  const countReady = orders.filter(o => o.status === 'ORDER_READY').length;
  const totalActive = countPlaced + countPreparing + countReady;

  // Time formatter helper
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Elapsed time helper
  const getElapsedMinutes = (isoString) => {
    if (!isoString) return '';
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
      if (diff <= 0) return 'Just now';
      if (diff === 1) return '1m ago';
      if (diff < 60) return `${diff}m ago`;
      const hours = Math.floor(diff / 60);
      return `${hours}h ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-slate-800 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <ChefHat size={26} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Kitchen Live Rail
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Kitchen Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live preparation tickets, station queue, and dish dispatch
            </p>
          </div>
        </div>

        {/* Quick Station Stats */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-center min-w-[90px]">
            <div className="text-xl sm:text-2xl font-bold text-rose-700 font-mono leading-tight">
              {countPlaced}
            </div>
            <div className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider mt-0.5">
              New Tickets
            </div>
          </div>

          <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center min-w-[90px]">
            <div className="text-xl sm:text-2xl font-bold text-amber-700 font-mono leading-tight">
              {countPreparing}
            </div>
            <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mt-0.5">
              Cooking
            </div>
          </div>

          <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center min-w-[90px]">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono leading-tight">
              {countReady}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">
              Ready
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
          <Filter size={14} className="text-slate-400" />
          <span>Filter:</span>
        </div>
        {[
          { id: 'ALL', label: `All Active (${totalActive})` },
          { id: 'PLACED', label: `New Tickets (${countPlaced})` },
          { id: 'KITCHEN_PREPARING', label: `Cooking (${countPreparing})` },
          { id: 'ORDER_READY', label: `Ready (${countReady})` }
        ].map(tab => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isActive 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 border-slate-200 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tickets Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Kitchen Rail Clear</h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-5">
            There are currently no active orders waiting at this station. New tickets will appear here automatically when placed.
          </p>
          <button
            onClick={() => setCurrentView('customer')}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UtensilsCrossed size={14} />
            <span>Open Online Menu</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {kitchenOrders.map((order) => {
            const isNew = order.status === 'PLACED';
            const isCooking = order.status === 'KITCHEN_PREPARING';
            const isReady = order.status === 'ORDER_READY';
            const totalItemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const timeString = formatTime(order.createdAt);
            const elapsed = getElapsedMinutes(order.createdAt);

            return (
              <div 
                key={order.id} 
                className={`p-5 rounded-2xl bg-white border flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
                  isNew 
                    ? 'border-rose-300 ring-2 ring-rose-500/10' 
                    : isCooking 
                    ? 'border-amber-300 ring-2 ring-amber-500/10' 
                    : 'border-emerald-300 ring-2 ring-emerald-500/10'
                }`}
              >
                {/* Ticket Header */}
                <div>
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base font-bold text-slate-900 font-mono">
                          #{order.id}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isNew 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : isCooking 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isNew && <Flame size={12} className="text-rose-500" />}
                          {isCooking && <Clock size={12} className="text-amber-500" />}
                          {isReady && <CheckCircle2 size={12} className="text-emerald-500" />}
                          <span>{isNew ? 'New Ticket' : isCooking ? 'Cooking' : 'Ready'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.orderType === 'dine-in' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                            Table {order.tableNumber}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                            <Bike size={13} className="text-amber-600" />
                            <span>Delivery</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-xs text-slate-500 font-medium">
                        <Clock size={13} className="text-slate-400" />
                        <span>{timeString}</span>
                      </div>
                      {elapsed && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {elapsed}
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 text-[11px] text-slate-600 mt-1">
                        <User size={12} className="text-slate-400" />
                        <span className="font-semibold">{order.customerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List Box */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200/70">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold font-mono">
                      Ticket Items ({totalItemCount} total):
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs py-0.5">
                          <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {item.quantity}x
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 leading-snug">
                              {item.name}
                            </div>
                            {item.notes && (
                              <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-md px-2 py-0.5 mt-1 inline-flex items-center gap-1 font-medium">
                                <AlertCircle size={11} className="shrink-0 text-amber-600" />
                                <span>Note: {item.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-1">
                  {isNew && (
                    <button
                      onClick={() => startPreparingOrder(order.id)}
                      className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Flame size={15} />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {isCooking && (
                    <button
                      onClick={() => markOrderReady(order.id)}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Mark as Ready</span>
                    </button>
                  )}

                  {isReady && (
                    <div className="py-2 px-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Ready for Pickup / Bill Generated</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
