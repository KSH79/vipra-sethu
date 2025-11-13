
import { Hero } from '@/components/landing/Hero'
import { DailyShloka } from '@/components/landing/DailyShloka'
import { PlatformGuide } from '@/components/landing/PlatformGuide'
import { WhyVipraSethu } from '@/components/landing/WhyVipraSethu'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { OurValues } from '@/components/landing/OurValues'
import { CommunityHighlights } from '@/components/landing/CommunityHighlights'
import { Footer } from '@/components/landing/Footer'
import { getLandingConfig } from '@/lib/actions/landing-config'
import { getDailyShloka } from '@/lib/actions/daily-shloka'
import { getPublishedPostsServer } from '@/lib/posts-server'

export const revalidate = 86400

export default async function LandingPage() {
  const [config, shloka, latestPosts] = await Promise.all([
    getLandingConfig(),
    getDailyShloka(),
    getPublishedPostsServer(undefined, 3)
  ])

  return (
    <main>
      <Hero config={config} />
      <div id="daily-shloka">
        <DailyShloka shloka={shloka} />
      </div>
      <PlatformGuide />
      <WhyVipraSethu />
      <HowItWorks />
      <OurValues />
      <CommunityHighlights posts={latestPosts.map(p => ({ id: p.id, title: p.title, type: p.type as any, created_at: p.created_at }))} />
      <Footer />
    </main>
  )
}
