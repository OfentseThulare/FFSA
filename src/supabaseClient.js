import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseMissing = !supabaseUrl || !supabaseKey

// Create a real client or a no-op placeholder so the app always renders
export const supabase = supabaseMissing
  ? createNoopClient()
  : createClient(supabaseUrl, supabaseKey)

function createNoopClient() {
  console.warn('Missing Supabase environment variables. Running in offline mode.')
  const noop = () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
  const noopAuth = {
    getSession: () => Promise.resolve({ data: { session: null } }),
    signInWithPassword: noop,
    signOut: () => Promise.resolve({}),
  }
  const noopFrom = () => ({ select: () => noop(), insert: () => ({ select: () => noop() }) })
  return { from: noopFrom, auth: noopAuth }
}
