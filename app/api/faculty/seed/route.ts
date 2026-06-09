import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const FACULTY = [
  { name: 'Angelo Cainap', email: 'acainap.faculty@mbsina.org' },
  { name: 'Ashe Valeroso', email: 'avaleroso.faculty@mbsina.org' },
  { name: 'Charles Co', email: 'cco.faculty@mbsina.org' },
  { name: 'Denisse Nisperos', email: 'dnisperos.faculty@mbsina.org' },
  { name: 'Erwin Dela Cruz', email: 'edelacruz.faculty@mbsina.org' },
  { name: 'Genalyn Concepcion', email: 'gconcepcion.faculty@mbsina.org' },
  { name: 'Harvey Grajo', email: 'hgrajo.faculty@mbsina.org' },
  { name: 'Joseph Concepcion', email: 'jconcepcion.faculty@mbsina.org' },
  { name: 'Jonathan Ferriol', email: 'jferriol.faculty@mbsina.org' },
  { name: 'Jennah Marie Orillaneda', email: 'jorillaneda.faculty@mbsina.org' },
  { name: 'Leo Marquez', email: 'lmarquez.faculty@mbsina.org' },
  { name: 'Larry Nisperos', email: 'lnisperos.faculty@mbsina.org' },
  { name: 'Michaella Agag', email: 'magag.faculty@mbsina.org' },
  { name: 'Maritess Ferriol', email: 'mferriol.faculty@mbsina.org' },
  { name: 'Madeline Macatol', email: 'mmacatol.faculty@mbsina.org' },
  { name: 'Miracle Ferriol', email: 'miraferriol.faculty@mbsina.org' },
  { name: 'Sygourney Grajo', email: 'sgrajo.faculty@mbsina.org' },
  { name: 'Tanya Bico', email: 'tbico.faculty@mbsina.org' },
];

const DEFAULT_PASSWORD = 'mbsi@1234';

export async function POST() {
  const results: { email: string; status: string; error?: string }[] = [];

  for (const member of FACULTY) {
    try {
      // Check if user already exists
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', member.email)
        .maybeSingle();

      if (existingProfile) {
        results.push({ email: member.email, status: 'already_exists' });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: member.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: member.name },
      });

      if (authError) {
        results.push({ email: member.email, status: 'error', error: authError.message });
        continue;
      }

      // Insert profile with must_change_password = true
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: member.email,
          full_name: member.name,
          role: 'teacher',
          must_change_password: true,
        });

      if (profileError) {
        results.push({ email: member.email, status: 'error', error: profileError.message });
        continue;
      }

      results.push({ email: member.email, status: 'created' });
    } catch (err: any) {
      results.push({ email: member.email, status: 'error', error: err.message });
    }
  }

  const created = results.filter((r) => r.status === 'created').length;
  const existing = results.filter((r) => r.status === 'already_exists').length;
  const errors = results.filter((r) => r.status === 'error').length;

  return NextResponse.json({
    total: FACULTY.length,
    created,
    existing,
    errors,
    details: results,
  });
}
