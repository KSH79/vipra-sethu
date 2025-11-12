import Image from 'next/image'
import Link from 'next/link'
import { LandingConfig } from '@/lib/types/landing'

export function Hero({ config }: { config: LandingConfig }) {
  return (
    <section className="relative min-h-[55vh] md:min-h-[65vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={config.background_image_url || '/images/temple-hero.jpg'}
          alt="Temple background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center text-white max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight drop-shadow-lg">Vipra Sethu</h1>
        <p className="mt-1.5 text-base md:text-lg text-white/95 drop-shadow">{config.primary_tagline}</p>
        <p className="mt-0.5 text-sm md:text-base text-white/80">{config.secondary_tagline}</p>

        <div className="mt-4 md:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link href="/providers" className="px-6 py-3 rounded-md bg-[#FF9933] hover:bg-[#e9892d] text-white font-semibold">
            {config.cta_primary_text}
          </Link>
          <Link href="/signup" className="px-6 py-3 rounded-md border border-white/70 text-white hover:bg-white/10 font-semibold">
            {config.cta_secondary_text}
          </Link>
          <a href="#daily-shloka" className="text-white/90 underline hover:text-white">Learn More</a>
        </div>
      </div>
    </section>
  )
}
