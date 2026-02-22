import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zrxdnpabbkhiljpdemwc.supabase.co'
const supabaseKey = 'sb_publishable_QpDliDe8WBd3SDkxyb6TqA_Me3SWLKX'
export const supabase = createClient(supabaseUrl, supabaseKey)
