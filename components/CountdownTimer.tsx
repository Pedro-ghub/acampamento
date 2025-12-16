'use client'

import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      // Data do evento: 14 de fevereiro de 2026 às 10h (horário local)
      const targetDate = new Date('2026-02-14T10:00:00-03:00') // UTC-3 (horário de Brasília)
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        setHasStarted(true)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / (1000 * 60)) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      return { days, hours, minutes, seconds }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (hasStarted) {
    return (
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            O acampamento já começou!
          </h2>
          <p className="text-gray-700 text-lg">
            Que este seja um tempo abençoado para todos os jovens e adolescentes! 🙏✨
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-8 px-4 mx-4 rounded-xl shadow-lg border border-slate-100">
      <h4 className="text-center text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
        Nosso acampamento começa em:
      </h4>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full border-2 border-slate-100">
            <span className="text-xl sm:text-2xl font-bold text-blue-900">{timeLeft.days}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Dias</span>
        </div>
        <span className="text-xl font-bold text-slate-300 -mt-5">:</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full border-2 border-slate-100">
            <span className="text-xl sm:text-2xl font-bold text-slate-700">{timeLeft.hours}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Hrs</span>
        </div>
        <span className="text-xl font-bold text-slate-300 -mt-5">:</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full border-2 border-slate-100">
            <span className="text-xl sm:text-2xl font-bold text-slate-700">{timeLeft.minutes}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Min</span>
        </div>
        <span className="text-xl font-bold text-slate-300 -mt-5">:</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full border-2 border-slate-100">
            <span className="text-xl sm:text-2xl font-bold text-slate-700">{timeLeft.seconds}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Seg</span>
        </div>
      </div>
    </section>
  )
}

