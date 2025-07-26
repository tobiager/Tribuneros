-- =====================================================
-- POLÍTICAS DE SEGURIDAD ADICIONALES
-- =====================================================

-- Política para profiles - solo el usuario puede ver/editar su perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para admins - pueden ver todos los perfiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Políticas para match_opinions
DROP POLICY IF EXISTS "Users can view all opinions" ON public.match_opinions;
CREATE POLICY "Users can view all opinions" ON public.match_opinions
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own opinions" ON public.match_opinions;
CREATE POLICY "Users can create own opinions" ON public.match_opinions
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own opinions" ON public.match_opinions;
CREATE POLICY "Users can update own opinions" ON public.match_opinions
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own opinions" ON public.match_opinions;
CREATE POLICY "Users can delete own opinions" ON public.match_opinions
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para match_views
DROP POLICY IF EXISTS "Users can view all match views" ON public.match_views;
CREATE POLICY "Users can view all match views" ON public.match_views
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own views" ON public.match_views;
CREATE POLICY "Users can create own views" ON public.match_views
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own views" ON public.match_views;
CREATE POLICY "Users can update own views" ON public.match_views
FOR UPDATE USING (auth.uid() = user_id);

-- Política para matches - lectura pública, escritura solo para admins
DROP POLICY IF EXISTS "Anyone can view matches" ON public.matches;
CREATE POLICY "Anyone can view matches" ON public.matches
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify matches" ON public.matches;
CREATE POLICY "Only admins can modify matches" ON public.matches
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Política para teams - lectura pública, escritura solo para admins
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
CREATE POLICY "Anyone can view teams" ON public.teams
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify teams" ON public.teams;
CREATE POLICY "Only admins can modify teams" ON public.teams
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
