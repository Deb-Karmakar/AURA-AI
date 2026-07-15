"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function MobileHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-on-surface-variant hover:text-primary transition-colors p-2">
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-3xl flex flex-col pt-6 px-6 pb-safe animate-in fade-in slide-in-from-bottom-12 duration-500 ease-out">
          <div className="flex justify-between items-center mb-16 animate-in fade-in slide-in-from-top-4 duration-500 delay-100 fill-mode-both">
            <Logo className="text-2xl" />
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-primary p-2">
              <X className="w-8 h-8" />
            </button>
          </div>
          
          <nav className="flex-1 flex flex-col gap-8 text-3xl font-body-md font-medium">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150 fill-mode-both">
              Dashboard
            </Link>
            <Link href="/interviews" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200 fill-mode-both">
              Interviews
            </Link>
            <Link href="/analytics" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both">
              Analytics
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500 fill-mode-both">
              Settings
            </Link>
            <button 
              onClick={() => {
                setIsOpen(false);
                import("next-auth/react").then((mod) => mod.signOut());
              }} 
              className="text-error hover:text-error/80 transition-colors text-left animate-in fade-in slide-in-from-bottom-8 duration-500 delay-[600ms] fill-mode-both mt-8"
            >
              Logout
            </button>
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}
