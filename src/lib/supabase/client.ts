import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Validate key format (should start with 'eyJ' and be reasonably long)
if (!supabaseKey.startsWith('eyJ') || supabaseKey.length < 100) {
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format. Please check your Supabase dashboard.')
}

console.log('🔑 Supabase client initializing with:', {
  url: supabaseUrl,
  keyLength: supabaseKey.length,
  keyPrefix: supabaseKey.substring(0, 10) + '...'
})

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types will be generated here
export type Database = {
  // TODO: Generate types from Supabase schema
}
