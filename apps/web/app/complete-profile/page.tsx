import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileCompletion } from '@/components/auth/ProfileCompletion'

export default async function CompleteProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/home')
  }

  return <ProfileCompletion userId={user.id} existingProfile={profile || undefined} />
}
