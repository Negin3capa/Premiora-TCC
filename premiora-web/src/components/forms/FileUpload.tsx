/**
 * Componente para upload de arquivos
 * Suporta preview, validação de tamanho e tipo de arquivo
 */
import React, { useRef } from 'react';

/**
 * Props do componente FileUpload
 */
interface FileUploadProps {
  /** ID único do input */
  id: string;
  /** Rótulo do campo */
  label: string;
  /** Arquivo atualmente selecionado */
  file: File | null;
  /** Tipos de arquivo aceitos (ex: "image/*") */
  accept?: string;
  /** Tamanho máximo em bytes */
  maxSize?: number;
  /** Dimensões recomendadas */
  recommendedDimensions?: string;
  /** Indica se é obrigatório */
  required?: boolean;
  /** Handler para mudança de arquivo */
  onChange: (file: File | null) => void;
  /** Handler para remoção do arquivo */
  onRemove: () => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente FileUpload - Upload de arquivo reutilizável
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  file,
  accept = "image/*",
  maxSize = 8 * 1024 * 1024, // 8MB por padrão
  recommendedDimensions,
  required = false,
  onChange,
  onRemove,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handler para seleção de arquivo
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onChange(selectedFile);
  };



  /**
   * Formata tamanho do arquivo
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Verifica se o arquivo é válido
   */
  const isValidFile = (file: File): boolean => {
    return file.size <= maxSize;
  };

  return (
    <div className={className} style={{ marginBottom: 'var(--space-4)' }}>
      <label
        style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)'
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-1)' }}>*</span>}
      </label>

      {!file ? (
        // Área de upload vazia
        <label
          htmlFor={id}
          style={{
            display: 'block',
            padding: 'var(--space-4)',
            border: '2px dashed var(--color-border-medium)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-medium)';
            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
          }}
        >
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-2)'
          }}>
            📁
          </div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--space-1)'
          }}>
            Adicionar arquivo
          </div>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-1)'
          }}>
            {accept.replace('image/', '').toUpperCase()} até {formatFileSize(maxSize)}
            {recommendedDimensions && ` • ${recommendedDimensions} recomendado`}
          </div>
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
      ) : (
        // Preview do arquivo
        <div style={{
          padding: 'var(--space-3)',
          border: '1px solid var(--color-border-medium)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          {/* Preview da imagem */}
          {file.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              style={{
                width: accept.includes('256x256') ? '48px' : '120px',
                height: accept.includes('256x256') ? '48px' : '30px',
                borderRadius: accept.includes('256x256') ? 'var(--radius-full)' : 'var(--radius-sm)',
                objectFit: 'cover'
              }}
            />
          )}

          {/* Informações do arquivo */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
              wordBreak: 'break-all'
            }}>
              {file.name}
            </div>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: isValidFile(file) ? 'var(--color-text-secondary)' : 'var(--color-error)'
            }}>
              {formatFileSize(file.size)}
              {!isValidFile(file) && ' (arquivo muito grande)'}
            </div>
          </div>

          {/* Botão de remover */}
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-error)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-lg)'
            }}
            title="Remover arquivo"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
