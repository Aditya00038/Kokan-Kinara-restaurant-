import React, { useState } from 'react';
import { X, Copy, ExternalLink, Printer, Check, QrCode, Sparkles } from 'lucide-react';

export default function QRCodeModal({ table, onClose, onOpenDineIn }) {
    const [copied, setCopied] = useState(false);

    if (!table) return null;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const dineInUrl = `${origin}/dine-in?table=${table.id}&token=${table.qrToken}`;

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(dineInUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 relative text-center space-y-4">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-1">
                        Table QR Dine-In
                    </span>
                    <h3 className="text-xl font-black text-neutral-900">Table #{table.number}</h3>
                    <p className="text-xs text-neutral-500">{table.section || 'Dining Hall'} • Capacity {table.capacity} Guests</p>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center space-y-3">
                    {/* Visual QR Representation */}
                    <div className="w-48 h-48 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                        {/* Authentic SVG QR Pattern */}
                        <svg className="w-full h-full text-neutral-900" viewBox="0 0 100 100" fill="currentColor">
                            {/* Corner Position Boxes */}
                            {/* Top Left */}
                            <rect x="5" y="5" width="26" height="26" rx="4" fill="currentColor" />
                            <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                            <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />
                            
                            {/* Top Right */}
                            <rect x="69" y="5" width="26" height="26" rx="4" fill="currentColor" />
                            <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                            <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />
                            
                            {/* Bottom Left */}
                            <rect x="5" y="69" width="26" height="26" rx="4" fill="currentColor" />
                            <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                            <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />
                            
                            {/* QR Data Grid Matrix Mock Pattern */}
                            <rect x="36" y="8" width="5" height="5" />
                            <rect x="45" y="8" width="5" height="5" />
                            <rect x="55" y="8" width="5" height="5" />
                            <rect x="36" y="18" width="5" height="5" />
                            <rect x="48" y="18" width="8" height="5" />
                            <rect x="36" y="26" width="12" height="5" />
                            <rect x="54" y="26" width="6" height="5" />
                            
                            <rect x="8" y="36" width="5" height="5" />
                            <rect x="18" y="36" width="5" height="5" />
                            <rect x="26" y="36" width="6" height="5" />
                            <rect x="36" y="36" width="8" height="8" />
                            <rect x="48" y="36" width="6" height="6" />
                            <rect x="58" y="36" width="8" height="8" />
                            <rect x="72" y="36" width="5" height="5" />
                            <rect x="82" y="36" width="8" height="5" />
                            
                            <rect x="8" y="48" width="8" height="5" />
                            <rect x="22" y="48" width="8" height="5" />
                            <rect x="36" y="48" width="5" height="8" />
                            <rect x="46" y="46" width="8" height="8" />
                            <rect x="58" y="48" width="6" height="5" />
                            <rect x="70" y="48" width="10" height="5" />
                            <rect x="86" y="48" width="5" height="5" />

                            <rect x="8" y="58" width="5" height="5" />
                            <rect x="18" y="58" width="8" height="5" />
                            <rect x="36" y="60" width="8" height="5" />
                            <rect x="48" y="58" width="5" height="8" />
                            <rect x="60" y="60" width="10" height="5" />
                            <rect x="76" y="58" width="6" height="8" />
                            <rect x="88" y="58" width="4" height="4" />

                            <rect x="36" y="72" width="6" height="5" />
                            <rect x="46" y="72" width="8" height="8" />
                            <rect x="58" y="72" width="5" height="5" />
                            <rect x="68" y="72" width="8" height="6" />
                            <rect x="80" y="72" width="6" height="6" />
                            <rect x="90" y="72" width="4" height="4" />

                            <rect x="36" y="84" width="8" height="5" />
                            <rect x="48" y="84" width="6" height="6" />
                            <rect x="60" y="84" width="8" height="6" />
                            <rect x="74" y="84" width="6" height="5" />
                            <rect x="84" y="84" width="8" height="6" />

                            {/* Center Logo */}
                            <circle cx="50" cy="50" r="10" fill="white" />
                            <circle cx="50" cy="50" r="8" fill="#e11d48" />
                        </svg>

                        <div className="absolute inset-0 bg-neutral-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-neutral-800 bg-white/90 px-2 py-1 rounded-md shadow-xs">
                                Table #{table.number}
                            </span>
                        </div>
                    </div>

                    <div className="text-center space-y-0.5">
                        <span className="text-[10px] text-neutral-500 font-mono">Token: {table.qrToken}</span>
                        <p className="text-[11px] text-neutral-600 font-medium">Scan to open digital table menu</p>
                    </div>
                </div>

                {/* Link and Actions */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 p-2 bg-neutral-100 rounded-xl border border-neutral-200 text-left">
                        <input
                            type="text"
                            readOnly
                            value={dineInUrl}
                            className="bg-transparent text-[11px] font-mono text-neutral-700 w-full outline-none truncate"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-1.5 bg-white hover:bg-neutral-50 text-neutral-700 rounded-lg shadow-2xs border border-neutral-200 transition-colors shrink-0 cursor-pointer"
                            title="Copy QR URL"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                            onClick={() => {
                                onClose();
                                if (onOpenDineIn) {
                                    onOpenDineIn(table.id, table.qrToken);
                                } else {
                                    window.open(dineInUrl, '_blank');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Open / Test Menu
                        </button>
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" /> Print Table Card
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
