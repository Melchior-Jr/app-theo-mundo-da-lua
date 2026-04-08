import React, { useState, useEffect } from 'react';
import { X, Save, Box, Palette, List, Type, Link as LinkIcon, Info } from 'lucide-react';
import styles from './AdminPage.module.css';
import { Subject } from '@/services/subjectService';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Partial<Subject>) => Promise<void>;
  subject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  subject 
}) => {
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    slug: '',
    description: '',
    icon: 'BookOpen',
    theme_color: '#00e5ff',
    order_index: 0,
    status: 'draft'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData(subject);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: 'BookOpen',
        theme_color: '#00e5ff',
        order_index: 0,
        status: 'draft'
      });
    }
  }, [subject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Limpa campos vazios ou undefined para evitar erros de cast no banco
      const cleanData = { ...formData };
      if (!cleanData.id) delete cleanData.id;
      if (!cleanData.created_at) delete cleanData.created_at;

      await onSave(cleanData);
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar jornada:', error);
      // Mostra a mensagem de erro real para diagnóstico
      const errorMsg = error.message || error.details || 'Erro desconhecido';
      alert(`Falha ao salvar: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
        <div className={styles.modalHeader}>
          <h3>{subject ? 'Editar Jornada' : 'Nova Jornada do Conhecimento'}</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label><Type size={16} /> Nome da Matéria</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Matemática, História..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label><LinkIcon size={16} /> Slug (URL)</label>
              <input 
                type="text" 
                value={formData.slug} 
                onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="ex: matematica"
                required
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label><Info size={16} /> Descrição / Convite</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Uma frase curta que convida o aluno a explorar..."
                rows={3}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label><Box size={16} /> Ícone (Lucide)</label>
              <input 
                type="text" 
                value={formData.icon} 
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                placeholder="BookOpen, GraduationCap, Globe..."
              />
            </div>

            <div className={styles.formGroup}>
              <label><Palette size={16} /> Cor do Tema (Hex)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="color" 
                  value={formData.theme_color} 
                  onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
                  style={{ width: '40px', padding: '0', height: '40px', border: 'none', background: 'none' }}
                />
                <input 
                  type="text" 
                  value={formData.theme_color} 
                  onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
                  placeholder="#00e5ff"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label><List size={16} /> Ordem</label>
              <input 
                type="number" 
                value={formData.order_index} 
                onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className={styles.adminSelect}
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="coming_soon">Em Breve</option>
              </select>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.secondaryBtn}>Cancelar</button>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              <Save size={20} />
              {saving ? 'Salvando...' : 'Salvar Jornada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
