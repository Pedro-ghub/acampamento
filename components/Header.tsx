'use client'

import Image from 'next/image'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-center h-16 px-4 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-auto">
          <Image
            src="/images/logo ump.jpeg"
            alt="Logo UMP"
            width={40}
            height={40}
            className="h-full w-auto object-contain"
            priority
          />
        </div>
        <div className="relative h-10 w-auto">
          <Image
            src="/images/logo upa.jpeg"
            alt="Logo UPA"
            width={40}
            height={40}
            className="h-full w-auto object-contain"
            priority
          />
        </div>
      </div>
    </header>
  )
}

