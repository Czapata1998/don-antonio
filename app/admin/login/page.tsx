'use client'

import { useActionState } from 'react'
import { Lock, Loader2, Scissors } from 'lucide-react'
import { iniciarSesion } from '@/app/admin/actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(iniciarSesion, {})

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-laton text-primary-foreground">
            <Scissors className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-marfil">
            Panel de Don Antonio
          </h1>
          <p className="mt-1 text-sm text-marfil-tenue">
            Ingresa para gestionar tu agenda.
          </p>
        </div>

        <form action={formAction} className="space-y-3">
          <label className="relative block">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marfil-tenue" />
            <input
              type="password"
              name="password"
              autoFocus
              autoComplete="current-password"
              placeholder="Contraseña"
              className="w-full rounded-xl border border-border bg-negro-base py-3 pl-10 pr-4 text-marfil outline-none transition-colors placeholder:text-marfil-tenue/60 focus:border-laton"
            />
          </label>

          {state?.error && (
            <p role="alert" className="text-sm text-[rgb(248_113_113)]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-laton py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
