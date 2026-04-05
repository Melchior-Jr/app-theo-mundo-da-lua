-- 📢 CONFIGURAÇÃO DO SISTEMA DE NOTIFICAÇÕES PUSH --

-- 1. Tabela para armazenar as inscrições de push (Browser)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de preferências (Criança/Responsável)
CREATE TABLE IF NOT EXISTS public.notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    categories JSONB DEFAULT '{"retention": true, "progress": true, "trophy": true, "mission": true, "curiosity": true, "content": true}'::jsonb,
    active_hours JSONB DEFAULT '{"morning": true, "afternoon": true, "evening": true}'::jsonb,
    is_parent_active BOOLEAN DEFAULT false,
    daily_limit INT DEFAULT 1,
    weekly_limit INT DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Registro de envios para controle de frequência (Deduplicação e Limites)
CREATE TABLE IF NOT EXISTS public.notification_push_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) --
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_push_logs ENABLE ROW LEVEL SECURITY;

-- Políticas --
CREATE POLICY "Users can manage their own subscriptions" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their settings" ON public.notification_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their push logs" ON public.notification_push_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 🛠️ TRIGGER: Gatilho automático para novos usuários criarem settings padrão --
CREATE OR REPLACE FUNCTION public.handle_new_user_notif_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_settings (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_notif
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notif_settings();
