"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function MobileHamburgerMenu() {
  console.log("MOBILE MENU IS RENDERING. ICON SHOULD BE SVG LINES!");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-on-surface-variant hover:text-primary transition-colors p-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-2xl flex flex-col pt-6 px-6 pb-safe animate-in fade-in zoom-in-95 duration-300 ease-out">
          <div className="flex justify-between items-center mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
            <Logo className="text-2xl" />
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-primary p-2">
              <X className="w-8 h-8" />
            </button>
          </div>
          
          <nav className="flex-1 flex flex-col gap-8 text-3xl font-body-md font-medium">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
              Dashboard
            </Link>
            <Link href="/interviews" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
              Interviews
            </Link>
            <Link href="/analytics" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
              Analytics
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
              Settings
            </Link>
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}
