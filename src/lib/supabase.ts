import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dtqoxemuvzzjpzsrhbts.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
  console.warn('⚠️ Supabase Anon Key não encontrada! Adicione VITE_SUPABASE_ANON_KEY ao seu arquivo .env.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
