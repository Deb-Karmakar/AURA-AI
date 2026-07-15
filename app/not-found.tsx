"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { FuzzyText } from "@/components/ui/fuzzy-text"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  const [enableHover, setEnableHover] = useState(true)
  const [hoverIntensity, setHoverIntensity] = useState(0.4)
  
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <FuzzyText
          baseIntensity={0.2}
          hoverIntensity={hoverIntensity}
          enableHover={enableHover}
          className="text-primary mb-4 max-w-full"
          fontSize="clamp(4rem, 25vw, 12rem)"
        >
          404
        </FuzzyText>
        
        <h2 className="font-headline-lg text-3xl md:text-5xl text-on-surface font-bold tracking-tight mb-4">
          Page not found
        </h2>
        
        <p className="font-body-md text-lg text-on-surface-variant max-w-md text-center mb-8">
          The page you are looking for doesn't exist or you don't have permission to access it.
        </p>

        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary-fixed-dim hover:shadow-[0_0_25px_rgba(219,252,255,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
