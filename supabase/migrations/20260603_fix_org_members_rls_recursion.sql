/*
  # Fix: Infinite Recursion in organization_members RLS

  The self-referencing policy on organization_members causes infinite recursion
  when any query touches organizations that check membership.

  Fix: Replace self-referencing subqueries with a SECURITY DEFINER function
  that bypasses RLS when checking membership.
*/

-- Create a helper function that bypasses RLS (SECURITY DEFINER runs as function owner)
CREATE OR REPLACE FUNCTION is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
$$;

-- Drop and recreate the problematic policies

-- Organizations: replace self-referencing with helper function
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to"
  ON organizations FOR SELECT
  TO authenticated
  USING (is_org_member(id));

DROP POLICY IF EXISTS "Organization admins can update their organization" ON organizations;
CREATE POLICY "Organization admins can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (is_org_admin(id))
  WITH CHECK (is_org_admin(id));

-- Organization Members: replace self-referencing with helper function
DROP POLICY IF EXISTS "Users can view members of their organization" ON organization_members;
CREATE POLICY "Users can view members of their organization"
  ON organization_members FOR SELECT
  TO authenticated
  USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "Organization admins can manage members" ON organization_members;
CREATE POLICY "Organization admins can manage members"
  ON organization_members FOR ALL
  TO authenticated
  USING (is_org_admin(organization_id))
  WITH CHECK (is_org_admin(organization_id));

-- Teams: replace with helper function
DROP POLICY IF EXISTS "Organization members can view teams" ON teams;
CREATE POLICY "Organization members can view teams"
  ON teams FOR SELECT
  TO authenticated
  USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "Organization admins can manage teams" ON teams;
CREATE POLICY "Organization admins can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (is_org_admin(organization_id))
  WITH CHECK (is_org_admin(organization_id));

-- Team Members: replace with helper function
DROP POLICY IF EXISTS "Team members can view their teams" ON team_members;
CREATE POLICY "Team members can view their teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_org_member((SELECT organization_id FROM teams WHERE id = team_members.team_id))
  );

DROP POLICY IF EXISTS "Team leads and org admins can manage team members" ON team_members;
CREATE POLICY "Team leads and org admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    is_org_admin((SELECT organization_id FROM teams WHERE id = team_members.team_id))
    OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'lead'
    )
  )
  WITH CHECK (
    is_org_admin((SELECT organization_id FROM teams WHERE id = team_members.team_id))
    OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'lead'
    )
  );

-- User Roles: replace with helper function
DROP POLICY IF EXISTS "Organization admins can view organization roles" ON user_roles;
CREATE POLICY "Organization admins can view organization roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND is_org_admin(organization_id)
    )
  );

DROP POLICY IF EXISTS "Organization admins can manage roles" ON user_roles;
CREATE POLICY "Organization admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND is_org_admin(organization_id)
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND is_org_admin(organization_id)
  );

-- Custom Roles: replace with helper function
DROP POLICY IF EXISTS "Organization members can view custom roles" ON custom_roles;
CREATE POLICY "Organization members can view custom roles"
  ON custom_roles FOR SELECT
  TO authenticated
  USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "Organization admins can manage custom roles" ON custom_roles;
CREATE POLICY "Organization admins can manage custom roles"
  ON custom_roles FOR ALL
  TO authenticated
  USING (is_org_admin(organization_id))
  WITH CHECK (is_org_admin(organization_id));

-- Custom Role Permissions: replace with helper function
DROP POLICY IF EXISTS "Organization members can view custom role permissions" ON custom_role_permissions;
CREATE POLICY "Organization members can view custom role permissions"
  ON custom_role_permissions FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM custom_roles WHERE id = custom_role_permissions.custom_role_id)));

DROP POLICY IF EXISTS "Organization admins can manage custom role permissions" ON custom_role_permissions;
CREATE POLICY "Organization admins can manage custom role permissions"
  ON custom_role_permissions FOR ALL
  TO authenticated
  USING (is_org_admin((SELECT organization_id FROM custom_roles WHERE id = custom_role_permissions.custom_role_id)))
  WITH CHECK (is_org_admin((SELECT organization_id FROM custom_roles WHERE id = custom_role_permissions.custom_role_id)));

-- User Custom Role Assignments: replace with helper function
DROP POLICY IF EXISTS "Organization admins can view all assignments" ON user_custom_role_assignments;
CREATE POLICY "Organization admins can view all assignments"
  ON user_custom_role_assignments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_org_admin((SELECT organization_id FROM custom_roles WHERE id = user_custom_role_assignments.custom_role_id))
  );

DROP POLICY IF EXISTS "Organization admins can manage assignments" ON user_custom_role_assignments;
CREATE POLICY "Organization admins can manage assignments"
  ON user_custom_role_assignments FOR ALL
  TO authenticated
  USING (is_org_admin((SELECT organization_id FROM custom_roles WHERE id = user_custom_role_assignments.custom_role_id)))
  WITH CHECK (is_org_admin((SELECT organization_id FROM custom_roles WHERE id = user_custom_role_assignments.custom_role_id)));

-- Activity Logs: replace with helper function
DROP POLICY IF EXISTS "Organization admins can view organization activity" ON activity_logs;
CREATE POLICY "Organization admins can view organization activity"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND is_org_admin(organization_id)
    )
  );
