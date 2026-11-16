/* eslint-disable */
// Cursor Image Trail — Originkit (Adapted for Kokan Kinara Coastal Cuisine)

import React, { useEffect, useMemo, useRef, useState } from "react";

export const FOOD_TRAIL_IMAGES = [
  "/chicken_handi.png",
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80", // Surmai Rava Fry
  "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80", // Kolambi Masala Fry
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", // Tandul Bhakri & Thali
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", // Refreshing Solkadhi
  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", // Steamed Ukadiche Modak
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", // Coastal Fish Curry
  "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", // Malvani Spiced Masala
];

const srcOf = (img) => (typeof img === "string" ? img : img?.src ?? "");

export default function CursorImageTrail({
  as: Tag = "section",
  images = FOOD_TRAIL_IMAGES,
  imageWidth = 135,
  imageHeight = 145,
  radius = 14,
  fit = "cover",
  position = "center",
  frequency = 36,
  visibleFor = 1.5,
  children,
  className = "",
  style = {},
  ...rest
}) {
  const urls = useMemo(() => {
    const list = (images ?? []).map(srcOf).filter(Boolean);
    return list.length ? list : FOOD_TRAIL_IMAGES;
  }, [images]);

  const threshold = 200 - ((frequency - 1) * 199) / 49;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeImages, setActiveImages] = useState([]);

  const pauseTimerRef = useRef(null);
  const clearTimerRef = useRef(null);
  const isMovingRef = useRef(false);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePos({ x, y });
    setIsHovering(true);
    isMovingRef.current = true;

    // Reset pause detection timers on cursor movement
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    // When cursor pauses (no movement for 300ms): stop hover animation & fade out images
    pauseTimerRef.current = setTimeout(() => {
      isMovingRef.current = false;
      setActiveImages((prev) =>
        prev.map((img) => ({ ...img, state: "exiting" }))
      );

      // Clean up completely once fade-out completes
      clearTimerRef.current = setTimeout(() => {
        setActiveImages([]);
      }, 350);
    }, 300);
  };

  const handleMouseEnter = () => setIsHovering(true);

  const handleMouseLeave = () => {
    setIsHovering(false);
    isMovingRef.current = false;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    // Immediately stop hover animation when leaving hero
    setActiveImages((prev) =>
      prev.map((img) => ({ ...img, state: "exiting" }))
    );
    clearTimerRef.current = setTimeout(() => {
      setActiveImages([]);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Only spawn images while hovering and actively moving
    if (!isHovering || !isMovingRef.current || urls.length === 0) return;
    const lastImage = activeImages[activeImages.length - 1];
    const distance = lastImage
      ? Math.hypot(mousePos.x - lastImage.x, mousePos.y - lastImage.y)
      : Infinity;
    if (distance <= threshold) return;

    const newImage = {
      id: Math.random() + Date.now(),
      position: currentImageIndex,
      x: mousePos.x,
      y: mousePos.y,
      rotation: (Math.random() - 0.5) * 12,
      state: "entering",
    };

    setActiveImages((prev) => {
      const next = [...prev, newImage];
      // Keep at most 8 latest boxes for clean performance
      return next.length > 8 ? next.slice(next.length - 8) : next;
    });
    setCurrentImageIndex((prev) => (prev + 1) % urls.length);

    // Box stays visible, then transitions to exiting
    const timerExit = setTimeout(() => {
      setActiveImages((prev) =>
        prev.map((img) =>
          img.id === newImage.id ? { ...img, state: "exiting" } : img
        )
      );
    }, visibleFor * 1000);

    // Remove from DOM after exit fade completes
    const timerRemove = setTimeout(() => {
      setActiveImages((prev) => prev.filter((img) => img.id !== newImage.id));
    }, visibleFor * 1000 + 400);

    return () => {
      clearTimeout(timerExit);
      clearTimeout(timerRemove);
    };
  }, [mousePos, isHovering, urls, threshold, currentImageIndex, visibleFor]);

  return (
    <Tag
      {...rest}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Hero Children / Content */}
      {children}

      {/* Floating Food Box Cards Trail */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {activeImages.map(({ id, position: slot, x, y, state, rotation = 0 }) => (
          <div
            key={id}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              backgroundImage: `url(${urls[slot]})`,
              backgroundSize: fit,
              backgroundPosition: fit === "cover" ? `center ${position}` : "center",
              backgroundRepeat: "no-repeat",
              borderRadius: `${radius}px`,
              border: "none",
              boxShadow:
                "0 20px 40px -6px rgba(12, 31, 56, 0.45), 0 10px 18px -3px rgba(0, 0, 0, 0.18)",
              pointerEvents: "none",
              willChange: "transform, opacity, filter",
              transform: `translate3d(${x - imageWidth / 2}px, ${y - imageHeight / 2}px, 0) scale(${
                state === "entering" ? 1 : 0.45
              }) rotate(${rotation}deg)`,
              opacity: state === "entering" ? 1 : 0,
              filter: state === "entering" ? "blur(0px)" : "blur(8px)",
              transition:
                state === "entering"
                  ? "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out, filter 0.3s ease-out"
                  : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in, filter 0.3s ease-in",
            }}
          />
        ))}
      </div>
    </Tag>
  );
}
