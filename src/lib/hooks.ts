"use client";

import { useEffect, useState } from "react";
import type { DashboardSnapshot, SignalStream } from "@/types/domain";
import { useLiveData } from "@/context/LiveDataContext";

export function useDashboard() {
  const { snapshot, dashboard, asOf, isRefreshing, lastError, refresh } = useLiveData();
  return { snapshot, dashboard, asOf, isRefreshing, lastError, refresh };
}

export function useSignals(initial: SignalStream[]) {
  const { dashboard, asOf: liveAsOf, refresh: refreshDashboard } = useLiveData();
  const [signals, setSignals] = useState(initial);

  useEffect(() => {
    if (dashboard?.streams) {
      setSignals(dashboard.streams);
    }
  }, [dashboard]);

  return {
    signals,
    asOf: liveAsOf,
    isRefreshing: false,
    lastError: null,
    refresh: refreshDashboard,
  };
}

export function useRevealOnScroll(selector = ".reveal") {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("is-visible");
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}

export function useAnimatedCounter(
  elementId: string,
  target: number,
  duration: number,
  decimals = false,
  delay = 0,
  refreshKey?: string
) {
  useEffect(() => {
    const el = document.getElementById(elementId);
    if (!el) return;

    let frame: number;
    const timeout = window.setTimeout(() => {
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = eased * target;
        el.textContent = decimals ? value.toFixed(1) : String(Math.round(value));
        if (progress < 1) frame = requestAnimationFrame(step);
      };

      frame = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [elementId, target, duration, decimals, delay, refreshKey]);
}

export function useCardSpotlight(cardIds: string[]) {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    cardIds.forEach((id) => {
      const node = document.getElementById(id);
      if (!node) return;

      const glowDiv = document.createElement("div");
      glowDiv.style.cssText = `
        position: absolute; width: 140px; height: 140px; border-radius: 50%;
        background: radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%);
        pointer-events: none; transform: translate(-50%, -50%);
        opacity: 0; transition: opacity 0.2s ease; z-index: 0;
      `;
      node.appendChild(glowDiv);

      const onMove = (e: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        glowDiv.style.left = `${e.clientX - rect.left}px`;
        glowDiv.style.top = `${e.clientY - rect.top}px`;
        glowDiv.style.opacity = "1";
        node.style.borderColor = "#2A2A2A";
      };

      const onLeave = () => {
        glowDiv.style.opacity = "0";
        node.style.borderColor = "#1A1A1A";
      };

      node.addEventListener("mousemove", onMove);
      node.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        node.removeEventListener("mousemove", onMove);
        node.removeEventListener("mouseleave", onLeave);
        glowDiv.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [cardIds]);
}

export function usePerspectiveTilt(
  selector: string,
  intensity = 10
) {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    const cleanups: (() => void)[] = [];

    nodes.forEach((node) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      node.style.transformStyle = "preserve-3d";

      const onMove = (e: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        node.style.transform = `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg)`;
      };

      const onLeave = () => {
        node.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg)";
      };

      node.addEventListener("mousemove", onMove);
      node.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        node.removeEventListener("mousemove", onMove);
        node.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [selector, intensity]);
}

export function useSnapshotCounters(snapshot: DashboardSnapshot) {
  const key = snapshot.asOf;
  useAnimatedCounter("counter-index", snapshot.riskIndex, 1400, true, 100, key);
  useAnimatedCounter("counter-exposed", snapshot.exposedCompanies, 1600, false, 250, key);
  useAnimatedCounter("counter-cvar-hero", snapshot.portfolioCvarB, 1800, true, 400, key);
  useAnimatedCounter("counter-signals", snapshot.liveSignalsCount, 2000, false, 550, key);
  useAnimatedCounter("bento-val-signals", snapshot.liveSignalsCount, 2000, false, 600, key);
  useAnimatedCounter("bento-val-exposed", snapshot.exposedCompanies, 1600, false, 700, key);
}
