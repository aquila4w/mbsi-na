import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Generate a random password
function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GET /api/admin/users — list all users with profiles
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ users: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/users — create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, role, password, must_change_password = true } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json({ error: 'email, full_name, and role are required' }, { status: 400 });
    }

    const userPassword = password || generatePassword();
    const forceChange = must_change_password !== false;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) throw authError;

    // Insert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role,
        must_change_password: forceChange,
      });

    if (profileError) throw profileError;

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email,
        full_name,
        role,
        must_change_password: forceChange,
      },
      generated_password: password ? undefined : userPassword,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
