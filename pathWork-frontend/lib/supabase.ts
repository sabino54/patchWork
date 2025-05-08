import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dnnbipwnvihuivthlqfx.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubmJpcHdudmlodWl2dGhscWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODIwMTMsImV4cCI6MjA2MTk1ODAxM30.WiK-cI77dajItcFNIEM9DZ298mhNI80KH0xyTbQdTNs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})