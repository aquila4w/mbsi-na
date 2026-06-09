/*
  # Add must_change_password flag to profiles

  When true, the user is redirected to /change-password on login.
  Set by admin when creating users or resetting passwords.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;
