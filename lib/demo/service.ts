import { supabase } from '@/lib/supabase';

export async function seedDemoData(): Promise<Record<string, any>> {
  const { data, error } = await supabase.rpc('seed_demo_data');
  if (error) throw error;
  return data;
}

export async function cleanupDemoData(): Promise<Record<string, any>> {
  const { data, error } = await supabase.rpc('cleanup_demo_data');
  if (error) throw error;
  return data;
}
