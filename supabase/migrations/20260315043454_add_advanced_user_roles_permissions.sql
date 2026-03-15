/*
  # Advanced User Roles & Permissions System

  This migration adds comprehensive role-based access control inspired by TestPortal.

  ## 1. New Tables

  ### User Role Management
  - `user_roles` - Extends existing enrollment roles with platform-wide roles
  - `role_permissions` - Define granular permissions per role
  - `custom_roles` - Allow organizations to create custom roles
  - `user_custom_role_assignments` - Assign custom roles to users

  ### Organization & Team Management
  - `organizations` - Multi-tenant organization support
  - `organization_members` - Track organization membership
  - `teams` - Subdivide organizations into teams/departments

  ### Audit & Activity Logging
  - `activity_logs` - Track all user actions for compliance
  - `login_history` - Security tracking for login attempts

  ## 2. Enhanced Permissions
  - Granular permissions for test creation, grading, viewing, management
  - Supervisor/Proctor specific permissions
  - Reviewer/Grader permissions
  - Multi-level access control

  ## 3. Security
  - Enable RLS on all new tables
  - Audit trail for all critical operations
  - Secure role assignment workflows
*/

-- ============================================
-- ORGANIZATION MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  logo_url text,
  settings jsonb DEFAULT '{}',
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_organization ON teams(organization_id);

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- ============================================
-- ADVANCED ROLE & PERMISSIONS SYSTEM
-- ============================================

-- Platform-wide user roles (extends course-specific roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  platform_role text NOT NULL CHECK (platform_role IN (
    'super_admin',
    'organization_admin',
    'test_creator',
    'test_taker',
    'reviewer',
    'supervisor',
    'proctor',
    'grader'
  )),
  scope text DEFAULT 'organization' CHECK (scope IN ('platform', 'organization', 'course')),
  scope_id uuid,
  granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_platform_role ON user_roles(platform_role);

-- Permission definitions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN (
    'test_management',
    'question_management',
    'grading',
    'analytics',
    'user_management',
    'proctoring',
    'organization'
  )),
  created_at timestamptz DEFAULT now()
);

-- Insert default permissions
INSERT INTO permissions (name, description, category) VALUES
  ('create_tests', 'Create new tests and quizzes', 'test_management'),
  ('edit_tests', 'Edit existing tests', 'test_management'),
  ('delete_tests', 'Delete tests', 'test_management'),
  ('publish_tests', 'Publish tests for students', 'test_management'),
  ('configure_proctoring', 'Configure proctoring settings', 'proctoring'),
  ('view_proctoring_data', 'View proctoring sessions and alerts', 'proctoring'),
  ('create_questions', 'Create questions in question bank', 'question_management'),
  ('edit_questions', 'Edit questions', 'question_management'),
  ('delete_questions', 'Delete questions', 'question_management'),
  ('grade_submissions', 'Grade student submissions', 'grading'),
  ('override_grades', 'Override automatic grades', 'grading'),
  ('view_all_submissions', 'View all student submissions', 'grading'),
  ('view_analytics', 'View quiz and question analytics', 'analytics'),
  ('export_results', 'Export quiz results and reports', 'analytics'),
  ('manage_users', 'Add/remove users and assign roles', 'user_management'),
  ('manage_organization', 'Manage organization settings', 'organization'),
  ('take_tests', 'Take tests as a student', 'test_management'),
  ('view_own_results', 'View own test results', 'test_management')
ON CONFLICT (name) DO NOTHING;

-- Role-permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- Assign default permissions to roles
INSERT INTO role_permissions (role, permission_id)
SELECT 'test_creator', id FROM permissions 
WHERE name IN ('create_tests', 'edit_tests', 'delete_tests', 'publish_tests', 'create_questions', 'edit_questions', 'delete_questions', 'configure_proctoring', 'grade_submissions', 'view_analytics', 'export_results')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'reviewer', id FROM permissions 
WHERE name IN ('grade_submissions', 'view_all_submissions', 'view_analytics')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'supervisor', id FROM permissions 
WHERE name IN ('view_proctoring_data', 'view_all_submissions', 'view_analytics')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'proctor', id FROM permissions 
WHERE name IN ('view_proctoring_data')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'grader', id FROM permissions 
WHERE name IN ('grade_submissions', 'view_all_submissions')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'test_taker', id FROM permissions 
WHERE name IN ('take_tests', 'view_own_results')
ON CONFLICT DO NOTHING;

-- Custom roles for organizations
CREATE TABLE IF NOT EXISTS custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_custom_roles_organization ON custom_roles(organization_id);

-- Custom role permissions
CREATE TABLE IF NOT EXISTS custom_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_role_id uuid NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(custom_role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_role_permissions_role ON custom_role_permissions(custom_role_id);

-- Assign custom roles to users
CREATE TABLE IF NOT EXISTS user_custom_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  custom_role_id uuid NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  scope text DEFAULT 'organization' CHECK (scope IN ('organization', 'team', 'course')),
  scope_id uuid,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, custom_role_id, scope, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_user_custom_role_assignments_user ON user_custom_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_role_assignments_role ON user_custom_role_assignments(custom_role_id);

-- ============================================
-- ACTIVITY LOGGING & AUDIT TRAIL
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN (
    'quiz', 'question', 'submission', 'user', 'role', 
    'organization', 'team', 'certificate', 'setting'
  )),
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_organization ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  login_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  location text,
  success boolean DEFAULT true,
  failure_reason text
);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_timestamp ON login_history(login_at);

-- ============================================
-- ENHANCED PROFILE FOR MULTI-ROLE SUPPORT
-- ============================================

-- Add organization reference to profiles
DO $$
BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
END $$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organizations they belong to"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Organization Members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their organization"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage members"
  ON organization_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view teams"
  ON teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = teams.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = teams.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = teams.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Team Members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view their teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM teams
      JOIN organization_members ON organization_members.organization_id = teams.organization_id
      WHERE teams.id = team_members.team_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team leads and org admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN organization_members ON organization_members.organization_id = teams.organization_id
      WHERE teams.id = team_members.team_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'lead'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      JOIN organization_members ON organization_members.organization_id = teams.organization_id
      WHERE teams.id = team_members.team_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'lead'
    )
  );

-- User Roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization admins can view organization roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = user_roles.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = user_roles.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = user_roles.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Permissions (read-only for all authenticated users)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- Role Permissions (read-only for all authenticated users)
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Custom Roles
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view custom roles"
  ON custom_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = custom_roles.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage custom roles"
  ON custom_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = custom_roles.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = custom_roles.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Custom Role Permissions
ALTER TABLE custom_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view custom role permissions"
  ON custom_role_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM custom_roles
      JOIN organization_members ON organization_members.organization_id = custom_roles.organization_id
      WHERE custom_roles.id = custom_role_permissions.custom_role_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage custom role permissions"
  ON custom_role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM custom_roles
      JOIN organization_members ON organization_members.organization_id = custom_roles.organization_id
      WHERE custom_roles.id = custom_role_permissions.custom_role_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_roles
      JOIN organization_members ON organization_members.organization_id = custom_roles.organization_id
      WHERE custom_roles.id = custom_role_permissions.custom_role_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- User Custom Role Assignments
ALTER TABLE user_custom_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom role assignments"
  ON user_custom_role_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization admins can view all assignments"
  ON user_custom_role_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM custom_roles
      JOIN organization_members ON organization_members.organization_id = custom_roles.organization_id
      WHERE custom_roles.id = user_custom_role_assignments.custom_role_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can manage assignments"
  ON user_custom_role_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM custom_roles
      JOIN organization_members ON organization_members.organization_id = custom_roles.organization_id
      WHERE custom_roles.id = user_custom_role_assignments.custom_role_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_roles
      JOIN organization_members ON organization_members.organization_id = custom_roles.organization_id
      WHERE custom_roles.id = user_custom_role_assignments.custom_role_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Activity Logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization admins can view organization activity"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = activity_logs.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Login History
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login history"
  ON login_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert login history"
  ON login_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();