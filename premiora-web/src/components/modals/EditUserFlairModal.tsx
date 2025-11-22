import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getCommunityFlairs, getUserCommunityFlair, updateUserCommunityFlair } from '../../utils/communityUtils';
import { useAuth } from '../../hooks/useAuth';
import type { CommunityFlair } from '../../types/community';
import '../../styles/EditUserFlairModal.css';

interface EditUserFlairModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  onFlairUpdated?: () => void;
}

const EditUserFlairModal: React.FC<EditUserFlairModalProps> = ({
  isOpen,
  onClose,
  communityId,
  onFlairUpdated
}) => {
  const { user } = useAuth();
  const [flairs, setFlairs] = useState<CommunityFlair[]>([]);
  const [selectedFlairId, setSelectedFlairId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && communityId && user) {
      loadData();
    }
  }, [isOpen, communityId, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load available flairs
      const availableFlairs = await getCommunityFlairs(communityId, 'user');
      setFlairs(availableFlairs);

      // Load current user flair
      const currentFlair = await getUserCommunityFlair(communityId, user!.id);
      if (currentFlair && currentFlair.flairId) {
        setSelectedFlairId(currentFlair.flairId);
      } else {
        setSelectedFlairId('');
      }
    } catch (error) {
      console.error('Error loading flair data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const success = await updateUserCommunityFlair(communityId, user.id, selectedFlairId);
      if (success) {
        if (onFlairUpdated) onFlairUpdated();
        onClose();
      } else {
        alert('Erro ao salvar flair. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving flair:', error);
      alert('Erro ao salvar flair.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content flair-modal">
        <div className="modal-header">
          <h2>Editar Flair de Usuário</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-spinner">Carregando...</div>
          ) : flairs.length === 0 ? (
            <div className="empty-state">
              Esta comunidade não possui flairs de usuário disponíveis.
            </div>
          ) : (
            <div className="flair-list">
              <div 
                className={`flair-option ${selectedFlairId === '' ? 'selected' : ''}`}
                onClick={() => setSelectedFlairId('')}
              >
                <div className="flair-preview">Nenhum</div>
              </div>
              
              {flairs.map(flair => (
                <div
                  key={flair.id}
                  className={`flair-option ${selectedFlairId === flair.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFlairId(flair.id)}
                >
                  <span 
                    className="flair-badge-preview"
                    style={{
                      color: flair.flairColor,
                      backgroundColor: flair.flairBackgroundColor,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {flair.flairText}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserFlairModal;
