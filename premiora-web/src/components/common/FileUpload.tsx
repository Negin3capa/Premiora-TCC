/**
 * Componente reutilizável para upload de arquivos
 * Suporta diferentes tipos de arquivo com preview e progresso
 */
import React from 'react';
import { Camera, Film, Video, X } from 'lucide-react';

/**
 * Tipos de arquivo suportados
 */
export type FileType = 'image' | 'video';

/**
 * Props do componente FileUpload
 */
interface FileUploadProps {
  /** Arquivo selecionado */
  file: File | null;
  /** Tipo de arquivo aceito */
  fileType: FileType;
  /** ID único para o input */
  inputId: string;
  /** Texto do título da área de upload */
  title: string;
  /** Texto da descrição da área de upload */
  subtitle: string;
  /** Callback chamado quando um arquivo é selecionado */
  onFileSelect: (file: File | null) => void;
  /** Indica se o upload está em progresso */
  isUploading?: boolean;
  /** Progresso do upload (0-100) */
  uploadProgress?: number;
  /** Indica se o componente está desabilitado */
  disabled?: boolean;
  /** Tamanho máximo do arquivo em MB */
  maxSizeMB?: number;
}

/**
 * Componente para upload de arquivos com preview
 * Reutilizável para diferentes tipos de arquivo
 */
const FileUpload: React.FC<FileUploadProps> = ({
  file,
  fileType,
  inputId,
  title,
  subtitle,
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  disabled = false,
  maxSizeMB
}) => {
  /**
   * Handler para seleção de arquivo
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    // Validação básica de tamanho se especificado
    if (selectedFile && maxSizeMB) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        alert(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
        return;
      }
    }

    onFileSelect(selectedFile);
  };

  /**
   * Handler para remoção do arquivo
   */
  const handleRemoveFile = () => {
    onFileSelect(null);
    // Reset input file
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) input.value = '';
  };

  /**
   * Formata tamanho do arquivo
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Obtém ícone baseado no tipo de arquivo
   */
  const getFileIcon = () => {
    if (fileType === 'video') return <Film size={32} />;
    return <Camera size={32} />;
  };

  /**
   * Obtém accept string baseado no tipo
   */
  const getAcceptString = () => {
    if (fileType === 'video') return 'video/*';
    return 'image/*';
  };

  // Renderiza preview se arquivo selecionado
  if (file) {
    const isImage = fileType === 'image';

    return (
      <div className="file-preview">
        {isImage ? (
          <img
            src={URL.createObjectURL(file)}
            alt="File preview"
            className="file-preview-image"
          />
        ) : (
          <div style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={32} />
          </div>
        )}

        <div className="file-preview-info">
          <div className="file-preview-name">{file.name}</div>
          <div className="file-preview-size">{formatFileSize(file.size)}</div>

          {isUploading && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleRemoveFile}
          className="file-preview-remove"
          title="Remover arquivo"
          disabled={disabled || isUploading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} />
        </button>

        {isUploading && (
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-success)',
            textAlign: 'center',
            marginTop: 'var(--space-2)'
          }}>
            Processando... {Math.round(uploadProgress)}%
          </div>
        )}
      </div>
    );
  }

  // Renderiza área de upload se nenhum arquivo selecionado
  return (
    <label
      htmlFor={inputId}
      className="file-upload-area"
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <div className="file-upload-icon">{getFileIcon()}</div>
      <div className="file-upload-title">{title}</div>
      <div className="file-upload-subtitle">{subtitle}</div>
      <input
        id={inputId}
        type="file"
        accept={getAcceptString()}
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
    </label>
  );
};

export default FileUpload;
