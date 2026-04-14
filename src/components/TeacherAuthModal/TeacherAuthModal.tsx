import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from './TeacherAuthModal.module.css';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isGoogleUser = user?.app_metadata?.provider === 'google';
  const [mode, setMode] = useState<'confirm' | 'setup'>('confirm');

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'confirm') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password,
        });

        if (authError) {
          if (authError.message.toLowerCase().includes('invalid login credentials') && isGoogleUser) {
            setError('Parece que você não tem uma senha local definida. Por favor, crie uma agora.');
            setMode('setup');
            setLoading(false);
            return;
          }
          throw authError;
        }

        onConfirm();
      } else {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });

        if (updateError) throw updateError;
        onConfirm();
      }
    } catch (err: any) {
      console.error('Erro na autenticação de professor:', err);
      setError(err.message || 'Erro ao validar sua identidade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconBox}>
            <ShieldCheck size={32} />
          </div>
          <h2>Área Restrita</h2>
          <p>
            {mode === 'confirm' 
              ? 'Confirme sua identidade para acessar o painel de professores.'
              : 'Sua conta Google precisa de uma senha para acessar áreas restritas.'}
          </p>
        </div>

        <form onSubmit={handleConfirm} className={styles.form}>
          <div className={styles.field}>
            <label>
              <Lock size={16} /> 
              {mode === 'confirm' ? 'Sua Senha' : 'Crie uma Senha'}
            </label>
            <div className={styles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'confirm' ? 'Digite sua senha' : 'Mínimo 6 caracteres'}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'setup' && (
            <div className={styles.field}>
              <label>Confirme a Senha</label>
              <div className={styles.inputWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{error}</span>
              {mode === 'confirm' && isGoogleUser && !error.includes('Parece que') && (
                <button 
                  type="button" 
                  className={styles.setupHint}
                  onClick={() => setMode('setup')}
                >
                  Nunca criei uma senha?
                </button>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
          >
            {loading ? 'Validando...' : mode === 'confirm' ? 'Entrar no Painel' : 'Salvar e Entrar'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Segurança Théo no Mundo da Lua</p>
        </div>
      </div>
    </div>
  );
};
