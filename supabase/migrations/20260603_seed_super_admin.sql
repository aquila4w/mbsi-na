/*
  # Seed Super Admin User

  Run this in the Supabase Dashboard SQL Editor.
  Creates: auth user → profile (admin role) → super_admin platform role.
*/

-- 1. Create auth user
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
VALUES (
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'lmarquez.faculty@mbsina.org',
  crypt('927Aaobth@85no', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Super Admin"}',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create profile with 'admin' base role
INSERT INTO profiles (id, email, full_name, role, bio)
SELECT
  u.id,
  u.email,
  'Super Admin',
  'admin',
  'Platform Super Administrator'
FROM auth.users u
WHERE u.email = 'lmarquez.faculty@mbsina.org'
ON CONFLICT (id) DO NOTHING;

-- 3. Assign super_admin platform role
INSERT INTO user_roles (user_id, platform_role, scope, granted_at)
SELECT
  u.id,
  'super_admin',
  'platform',
  now()
FROM auth.users u
WHERE u.email = 'lmarquez.faculty@mbsina.org'
ON CONFLICT DO NOTHING;
