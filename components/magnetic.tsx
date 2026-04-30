"use client";

import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  strength?: number;
};

export function Magnetic({ children, strength = 0.25 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  function onMove(e: React.MouseEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * strength;
    const y = (e.clientY - r.top - r.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <span
      ref={ref}
      className="magnetic"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </span>
  );
}
