-- 🏆 TABELA DE TROFÉUS DO USUÁRIO
-- Armazena o progresso individual de cada troféu (ex: 15/50 abates)
CREATE TABLE IF NOT EXISTS public.user_trophies (
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    trophy_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, trophy_id)
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.user_trophies ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler seus próprios troféus
CREATE POLICY "Users can view their own trophies" 
ON public.user_trophies FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seu próprio progresso
CREATE POLICY "Users can insert their own progress" 
ON public.user_trophies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seu próprio progresso
CREATE POLICY "Users can update their own progress" 
ON public.user_trophies FOR UPDATE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_trophies_user_id ON public.user_trophies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trophies_unlocked ON public.user_trophies(unlocked) WHERE unlocked = TRUE;

-- Garantir que a tabela global de stats tenha as colunas necessárias
-- Se não existir a coluna total_trophies, adicionamos
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='player_global_stats' AND column_name='total_trophies') THEN
    ALTER TABLE public.player_global_stats ADD COLUMN total_trophies INTEGER DEFAULT 0;
  END IF;
END $$;
