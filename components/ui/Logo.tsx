import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"], 
  weight: ["400"], 
  style: ["normal", "italic"], 
  display: "swap" 
});

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`${instrumentSerif.className} font-bold text-primary tracking-tighter ${className}`}>
      AURA AI
    </div>
  );
}
