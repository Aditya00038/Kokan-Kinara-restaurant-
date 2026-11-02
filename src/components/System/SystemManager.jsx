import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { 
  Activity, 
  RotateCcw,
  Cloud,
  Crown
} from 'lucide-react';

export default function SystemManager() {
  const { 
    tables, 
    toggleTableStatus, 
    menu, 
    toggleItemStock, 
    systemLogs, 
    resetToDemoState 
  } = useRestaurant();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-slate-100">
      
      {/* Header Banner (Purple / Violet Admin) */}
      <div className="glass-panel p-6 sm:p-8 mb-7 bg-gradient-to-r from-purple-500/15 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl flex justify-between items-center flex-wrap gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30">
            <Crown size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-purple text-[10px]">
                Swimlane 2: Manager & Admin (@admin.com)
              </span>
              <span className="text-xs text-purple-300 font-mono">Live Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              System & Real-Time State Controller
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Validate orders, manage real-time table occupancies, toggle dish stock to test alternative item suggestions, and inspect live event logs.
            </p>
          </div>
        </div>

        {/* Cloud Backend & Firebase Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-950/80 rounded-2xl border border-purple-500/30 flex items-center gap-2.5">
            <Cloud size={18} className="text-amber-400" />
            <div>
              <div className="text-xs font-bold text-white">
                Firebase Firestore
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                auth-3ea33 • Online
              </div>
            </div>
          </div>

          <button
            onClick={resetToDemoState}
            className="btn-secondary text-xs px-4 py-2.5 cursor-pointer font-bold"
          >
            <RotateCcw size={14} className="text-amber-400" /> Reset State
          </button>
        </div>
      </div>

      {/* Main Grid: Tables + Stock Manager on Left, System Audit Stream on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Tables & Inventory stock controllers */}
        <div className="flex flex-col gap-6">
          
          {/* Tables Management Grid */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Dining Tables & Occupancy</h3>
                <p className="text-xs text-slate-400">
                  Click status button on any table to toggle. Used by System to validate availability.
                </p>
              </div>
              <span className="badge badge-purple text-[10px]">{tables.length} Tables</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tables.map(tbl => {
                const isAvail = tbl.status === 'available';
                const isOcc = tbl.status === 'occupied';

                return (
                  <div
                    key={tbl.id}
                    className={`p-3 rounded-2xl bg-slate-950/80 border text-center transition-all ${
                      isOcc ? 'border-rose-500/40' : 'border-white/10'
                    }`}
                  >
                    <div className="text-base font-black text-white font-mono">
                      Table {tbl.number}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-2 font-mono">
                      {tbl.capacity} seats • {tbl.section}
                    </div>

                    <button
                      onClick={() => toggleTableStatus(tbl.id, isAvail ? 'occupied' : isOcc ? 'reserved' : 'available')}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
                        isAvail 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : isOcc 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {tbl.status}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menu Items Stock Toggle (To test diagram alternative suggestion!) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Menu Inventory & Stock Control</h3>
                <p className="text-xs text-slate-400">
                  Toggle items OUT OF STOCK to test the Diagram's <em>"Items available? No &rarr; Suggest alternative"</em> workflow!
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {menu.map(item => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center p-3 rounded-2xl bg-slate-950/80 border transition-all ${
                    !item.inStock ? 'border-rose-500/30' : 'border-white/5'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-white text-xs">{item.name}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {item.category} • ₹{item.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleItemStock(item.id)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      item.inStock 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {item.inStock ? `In Stock (${item.stockCount})` : 'Sold Out (Trigger Alt)'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: System Audit Log Stream */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 h-full">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-amber-400" />
              <h3 className="text-base font-bold text-white">System Activity Event Stream</h3>
            </div>
            <span className="status-dot-pulse" />
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Real-time audit log of automated system events: order validations, table status shifts, bill generation, and payment verifications.
          </p>

          <div className="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
            {systemLogs.map(log => {
              const isDanger = log.type === 'danger';
              const isSuccess = log.type === 'success';
              const isWarning = log.type === 'warning';

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border-l-4 ${
                    isDanger 
                      ? 'bg-rose-500/10 border-l-rose-500 text-rose-200' 
                      : isSuccess 
                      ? 'bg-emerald-500/10 border-l-emerald-500 text-emerald-200' 
                      : isWarning 
                      ? 'bg-amber-500/10 border-l-amber-500 text-amber-200' 
                      : 'bg-blue-500/10 border-l-blue-500 text-blue-200'
                  }`}
                >
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span className="font-bold text-slate-300">{log.sender}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="text-xs leading-relaxed text-white">
                    {log.message}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
