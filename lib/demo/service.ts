import { supabase } from '@/lib/supabase';

const DEMO_USERS = [
  { email: 'santos@demo.mbsina.org', name: 'Prof. Eduardo Santos', role: 'teacher' },
  { email: 'reyes@demo.mbsina.org', name: 'Prof. Maria Reyes', role: 'teacher' },
  { email: 'cruz@demo.mbsina.org', name: 'Prof. Antonio Cruz', role: 'teacher' },
  { email: 'marco@demo.mbsina.org', name: 'Marco Rivera', role: 'ta' },
  { email: 'maria@demo.mbsina.org', name: 'Maria Garcia', role: 'student' },
  { email: 'juan@demo.mbsina.org', name: 'Juan Dela Cruz', role: 'student' },
  { email: 'ana@demo.mbsina.org', name: 'Ana Reyes', role: 'student' },
  { email: 'pedro@demo.mbsina.org', name: 'Pedro Santos', role: 'student' },
  { email: 'rosa@demo.mbsina.org', name: 'Rosa Mendoza', role: 'student' },
  { email: 'luis@demo.mbsina.org', name: 'Luis Ramos', role: 'student' },
  { email: 'carmen@demo.mbsina.org', name: 'Carmen Villareal', role: 'student' },
  { email: 'diego@demo.mbsina.org', name: 'Diego Santiago', role: 'student' },
];

const PASSWORD = 'Demo@1234';

export async function seedDemoData(): Promise<Record<string, any>> {
  const { data: { session: originalSession } } = await supabase.auth.getSession();
  const adminEmail = originalSession?.user?.email || '';
  const adminPassword = prompt('Re-enter your admin password (needed to restore your session):');
  if (!adminPassword) throw new Error('Password required');

  const userIds: Record<string, string> = {};

  // Clean up first
  await supabase.rpc('cleanup_demo_data');

  // Create auth users via signUp (properly hashes passwords through Supabase Auth)
  for (const user of DEMO_USERS) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: PASSWORD,
        options: { data: { full_name: user.name } },
      });
      if (error && !error.message.includes('already registered')) throw error;
      if (data.user) userIds[user.email] = data.user.id;
    } catch (err: any) {
      console.error(`Error creating ${user.email}:`, err.message);
    }
  }

  // Restore admin session
  await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });

  // Create profiles and all course data via SQL
  const { data, error } = await supabase.rpc('seed_demo_data', { p_user_ids: userIds });
  if (error) throw error;

  return { ...data, users_created: Object.keys(userIds).length };
}

export async function cleanupDemoData(): Promise<Record<string, any>> {
  const { data, error } = await supabase.rpc('cleanup_demo_data');
  if (error) throw error;
  return data;
}
