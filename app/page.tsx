import { AuroraBackground } from '@/components/aurora-background'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
import { HowItWorks } from '@/components/how-it-works'
import { About } from '@/components/about'
import { Gallery } from '@/components/gallery'
import { Footer } from '@/components/footer'
import { BookingProvider } from '@/components/booking/booking-context'
import { BookingFlow } from '@/components/booking/booking-flow'
import { ThemeProvider } from '@/components/theme/theme-context'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'

export default function Page() {
  return (
    <ThemeProvider>
      <BookingProvider>
        <div className="grain relative min-h-screen">
          <AuroraBackground />
          <Navbar />
          <main>
            <Hero />
            <Services />
            <HowItWorks />
            <About />
            <Gallery />
          </main>
          <Footer />
          <BookingFlow />
          <ThemeSwitcher />
        </div>
      </BookingProvider>
    </ThemeProvider>
  )
}
