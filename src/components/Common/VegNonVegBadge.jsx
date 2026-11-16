import React from 'react';

/**
 * Standard Indian FSSAI Veg / Non-Veg Indicator
 * Green square with green circle for VEG
 * Red square with red circle for NON-VEG
 */
export function VegNonVegIcon({ isVeg, size = 16, className = '' }) {
    // Exact colors matching standard Indian food dietary symbols
    const strokeColor = isVeg ? '#16a34a' : '#e11d48'; // green-600 vs rose-600
    const fillColor = isVeg ? '#16a34a' : '#e11d48';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 inline-block align-middle ${className}`}
            aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        >
            {/* Square outer frame with clean white background and rounded corners */}
            <rect
                x="2.5"
                y="2.5"
                width="19"
                height="19"
                rx="3.5"
                stroke={strokeColor}
                strokeWidth="2.5"
                fill="#ffffff"
            />
            {/* Centered solid dot */}
            <circle
                cx="12"
                cy="12"
                r="5.5"
                fill={fillColor}
            />
        </svg>
    );
}

/**
 * Dish Badge with SVG Symbol and crisp label (VEG / NON-VEG)
 */
export default function VegNonVegBadge({ 
    isVeg, 
    showLabel = true, 
    size = 'md',
    layout = 'horizontal',
    className = '' 
}) {
    const isSm = size === 'sm';
    const iconSize = isSm ? 13 : 16;
    const textColor = isVeg ? 'text-emerald-700' : 'text-rose-600';
    const borderColor = isVeg ? 'border-emerald-200/80' : 'border-rose-200/80';

    if (!showLabel) {
        return (
            <span className={`inline-flex items-center justify-center bg-white/95 backdrop-blur-xs p-0.5 rounded-md shadow-2xs border ${borderColor} ${className}`}>
                <VegNonVegIcon isVeg={isVeg} size={iconSize} />
            </span>
        );
    }

    if (layout === 'vertical') {
        return (
            <div className={`inline-flex flex-col items-center bg-white/95 backdrop-blur-xs px-1.5 py-1 rounded-md shadow-xs border ${borderColor} ${className}`}>
                <VegNonVegIcon isVeg={isVeg} size={iconSize} />
                <span className={`text-[9px] font-black tracking-tight leading-tight mt-0.5 ${textColor}`}>
                    {isVeg ? 'VEG' : 'NON-VEG'}
                </span>
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs border ${borderColor} select-none ${className}`}>
            <VegNonVegIcon isVeg={isVeg} size={iconSize} />
            <span className={`text-[10px] font-black tracking-wider uppercase ${textColor}`}>
                {isVeg ? 'VEG' : 'NON-VEG'}
            </span>
        </span>
    );
}
