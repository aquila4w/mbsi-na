import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

export async function POST() {
  try {
    // Step 1: Clean up existing demo data
    await supabaseAdmin.rpc('cleanup_demo_data');

    // Step 2: Create auth users via admin API (properly hashes passwords)
    const userIds: Record<string, string> = {};
    const errors: string[] = [];

    for (const user of DEMO_USERS) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: user.name },
      });

      if (error) {
        errors.push(`${user.email}: ${error.message}`);
        continue;
      }

      if (data.user) {
        userIds[user.email] = data.user.id;
      }
    }

    if (Object.keys(userIds).length === 0) {
      return NextResponse.json(
        { error: 'No users created', errors },
        { status: 500 }
      );
    }

    // Step 3: Create profiles and all course data via SQL function
    const { data: seedResult, error: seedError } = await supabaseAdmin.rpc(
      'seed_demo_data',
      { p_user_ids: userIds }
    );

    if (seedError) {
      return NextResponse.json(
        { error: seedError.message, users_created: userIds, errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...seedResult,
      users_created: Object.keys(userIds).length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
