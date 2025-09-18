"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  borderRadius?: string;
  background?: string;
  className?: string;
  children: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({
    shimmerColor = "#ffffff",
    shimmerSize = "0.05em",
    shimmerDuration = "3s",
    borderRadius = "8px",
    background = "linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)",
    className,
    children,
    ...props
  }, ref) => {
    return (
      <button
        style={{
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        } as React.CSSProperties}
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden [border-radius:var(--radius)]",
            "before:absolute before:inset-0",
            "before:animate-shimmer-slide before:[background-image:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]",
            "before:[background-size:calc(100%-var(--cut))_calc(100%-var(--cut))]",
            "before:[background-position:50%_50%]",
            "before:[background-repeat:no-repeat]"
          )}
        />

        {/* Spark container */}
        <div
          className={cn(
            "absolute -inset-px -z-10 rounded-[calc(var(--radius)-1px)]",
            "bg-gradient-to-br from-white/20 via-transparent to-transparent",
            "opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          )}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          {children}
        </div>

        {/* Inner glow */}
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-[var(--radius)]",
            "bg-gradient-to-br from-white/10 via-transparent to-transparent",
            "opacity-0 transition-opacity duration-300 group-hover:opacity-50"
          )}
        />
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";