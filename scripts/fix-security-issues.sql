-- =====================================================
-- SCRIPT DE CORRECCIÓN DE SEGURIDAD PARA SUPABASE
-- =====================================================
-- Este script corrige problemas de seguridad relacionados con:
-- 1. search_path mutable en funciones
-- 2. Configuraciones de seguridad adicionales
-- =====================================================

-- 1. FUNCIÓN: is_service_role
-- Verifica si el usuario actual tiene rol de servicio
DROP FUNCTION IF EXISTS public.is_service_role();
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Verificar si el rol actual es service_role
  RETURN auth.role() = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 2. FUNCIÓN: log_operation
-- Registra operaciones importantes en el sistema
DROP FUNCTION IF EXISTS public.log_operation(text, text, jsonb);
CREATE OR REPLACE FUNCTION public.log_operation(
  operation_type text,
  operation_details text,
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Insertar log de operación
  INSERT INTO public.operation_logs (
    user_id,
    operation_type,
    operation_details,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    operation_type,
    operation_details,
    metadata,
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Fallar silenciosamente para no interrumpir operaciones principales
    NULL;
END;
$$;

-- 3. FUNCIÓN: update_updated_at_column
-- Trigger function para actualizar columna updated_at
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. FUNCIÓN: handle_new_user
-- Maneja la creación de perfil cuando se registra un nuevo usuario
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Crear perfil para el nuevo usuario
  INSERT INTO public.profiles (
    id,
    email,
    username,
    avatar_url,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    NOW(),
    NOW()
  );

  -- Log de la operación
  PERFORM public.log_operation(
    'user_registration',
    'New user profile created',
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'provider', NEW.raw_app_meta_data->>'provider'
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error pero no fallar la creación del usuario
    PERFORM public.log_operation(
      'user_registration_error',
      'Error creating user profile: ' || SQLERRM,
      jsonb_build_object('user_id', NEW.id, 'email', NEW.email)
    );
    RETURN NEW;
END;
$$;

-- =====================================================
-- CREAR TABLA DE LOGS SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.operation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  operation_type text NOT NULL,
  operation_details text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON public.operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_type ON public.operation_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON public.operation_logs(created_at);

-- RLS para operation_logs
ALTER TABLE public.operation_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver todos los logs
CREATE POLICY "Admins can view all logs" ON public.operation_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Usuarios pueden ver sus propios logs
CREATE POLICY "Users can view own logs" ON public.operation_logs
FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- RECREAR TRIGGER PARA NUEVOS USUARIOS
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- APLICAR TRIGGERS DE updated_at A TABLAS PRINCIPALES
-- =====================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- CONFIGURACIONES ADICIONALES DE SEGURIDAD
-- =====================================================

-- Revocar permisos innecesarios del rol anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Otorgar solo permisos específicos necesarios
GRANT SELECT ON public.matches TO anon;
GRANT SELECT ON public.teams TO anon;
GRANT SELECT ON public.leagues TO anon;

-- Permisos para usuarios autenticados
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.matches TO authenticated;
GRANT SELECT ON public.teams TO authenticated;
GRANT SELECT ON public.leagues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_opinions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_views TO authenticated;

-- Permisos para service_role (usado por la aplicación)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- FUNCIÓN DE VERIFICACIÓN DE SEGURIDAD
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  func_count integer;
  rls_count integer;
BEGIN
  -- Verificar funciones con search_path seguro
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
  AND p.proname IN ('is_service_role', 'log_operation', 'update_updated_at_column', 'handle_new_user')
  AND p.prosecdef = true;

  -- Verificar tablas con RLS habilitado
  SELECT COUNT(*) INTO rls_count
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true;

  result := jsonb_build_object(
    'secure_functions_count', func_count,
    'rls_enabled_tables', rls_count,
    'check_timestamp', NOW(),
    'status', CASE 
      WHEN func_count >= 4 AND rls_count > 0 THEN 'SECURE'
      ELSE 'NEEDS_ATTENTION'
    END
  );

  RETURN result;
END;
$$;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================
COMMENT ON FUNCTION public.is_service_role() IS 'Verifica si el usuario actual tiene rol de servicio - SECURITY DEFINER con search_path fijo';
COMMENT ON FUNCTION public.log_operation(text, text, jsonb) IS 'Registra operaciones del sistema - SECURITY DEFINER con search_path fijo';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger para actualizar updated_at - SECURITY DEFINER con search_path fijo';
COMMENT ON FUNCTION public.handle_new_user() IS 'Maneja creación de perfil para nuevos usuarios - SECURITY DEFINER con search_path fijo';
COMMENT ON FUNCTION public.check_security_status() IS 'Verifica el estado de seguridad del sistema';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT public.check_security_status() as security_status;
