'use client'

import { useId, useState } from 'react'

export function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  inputMode?: 'text' | 'tel' | 'numeric' | 'email'
  autoComplete?: string
}) {
  const id = useId()
  const [focus, setFocus] = useState(false)
  const flotando = focus || value.length > 0

  // El email no debe autocapitalizar ni autocorregir (rompe la dirección en móvil).
  const esEmail = type === 'email'
  const modo = inputMode ?? (esEmail ? 'email' : undefined)

  return (
    <div
      className={`glass glass-edge relative rounded-xl px-4 pb-2.5 pt-6 transition-shadow ${
        focus ? 'shadow-[0_0_0_2px_rgb(var(--laton-rgb)/0.6)]' : ''
      }`}
    >
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 origin-left transition-all duration-200 ${
          flotando
            ? 'top-2 text-xs text-laton-claro'
            : 'top-1/2 -translate-y-1/2 text-base text-marfil-tenue'
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={modo}
        autoComplete={autoComplete}
        autoCapitalize={esEmail ? 'none' : undefined}
        autoCorrect={esEmail ? 'off' : undefined}
        spellCheck={esEmail ? false : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="w-full bg-transparent text-base text-marfil outline-none"
      />
    </div>
  )
}
