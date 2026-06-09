import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// POST /api/admin/users/[userId]/reset-password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { password, must_change_password = true } = body;

    const newPassword = password || generatePassword();

    // Update auth user password
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (authError) throw authError;

    // Set must_change_password flag on profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ must_change_password: must_change_password !== false })
      .eq('id', userId);

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      generated_password: password ? undefined : newPassword,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
