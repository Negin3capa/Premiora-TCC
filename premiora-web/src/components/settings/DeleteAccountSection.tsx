/**
 * Componente para seção de exclusão de conta
 * Inclui confirmação e lógica de exclusão
 */
import React, { useState } from 'react';

/**
 * Props do componente DeleteAccountSection
 */
interface DeleteAccountSectionProps {
  /** Handler para exclusão de conta */
  onDeleteAccount: () => Promise<void>;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente DeleteAccountSection - Seção de exclusão de conta
 */
export const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({
  onDeleteAccount,
  className = ''
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handler para iniciar processo de exclusão
   */
  const handleDeleteClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    // Se já está mostrando confirmação, prosseguir com exclusão
    handleConfirmDelete();
  };

  /**
   * Handler para confirmar exclusão
   */
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setIsDeleting(false);
    }
  };

  /**
   * Handler para cancelar exclusão
   */
  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className={`setting-group danger-zone ${className}`}>
      <h4>Zona de Perigo</h4>
      <div className="setting-item">
        <div className="delete-account-section">
          <h5>Excluir Conta</h5>
          <p className="setting-description">
            Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
          </p>

          {!showConfirm ? (
            <button
              className="btn-danger"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              Excluir Conta
            </button>
          ) : (
            <div className="delete-confirm">
              <p>Tem certeza de que deseja excluir sua conta?</p>
              <div className="confirm-buttons">
                <button
                  className="btn-secondary"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
