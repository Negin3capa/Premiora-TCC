/**
 * Componente genérico para campos de formulário
 * Fornece interface consistente para inputs, textareas e outros campos
 */
import React from 'react';

/**
 * Props do componente FormField
 */
interface FormFieldProps {
  /** ID único do campo */
  id: string;
  /** Rótulo do campo */
  label: string;
  /** Tipo do input (text, email, password, etc.) */
  type?: 'text' | 'email' | 'password' | 'textarea';
  /** Valor do campo */
  value: string;
  /** Placeholder do campo */
  placeholder?: string;
  /** Indica se o campo é obrigatório */
  required?: boolean;
  /** Indica se o campo está desabilitado */
  disabled?: boolean;
  /** Máximo de caracteres */
  maxLength?: number;
  /** Número de linhas para textarea */
  rows?: number;
  /** Mensagem de erro */
  error?: string;
  /** Texto de ajuda */
  helpText?: string;
  /** Handler para mudança de valor */
  onChange: (value: string) => void;
  /** Handler para foco */
  onFocus?: () => void;
  /** Handler para perda de foco */
  onBlur?: () => void;
  /** Estilos customizados */
  style?: React.CSSProperties;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente FormField - Campo de formulário reutilizável
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  rows = 4,
  error,
  helpText,
  onChange,
  onFocus,
  onBlur,
  style,
  className = ''
}) => {
  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-medium)'}`,
    borderRadius: 'var(--radius-lg)',
    fontSize: 'var(--font-size-base)',
    backgroundColor: disabled ? 'var(--color-bg-disabled)' : 'var(--color-bg-secondary)',
    color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
    fontFamily: 'inherit',
    ...style
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!disabled && !error) {
      e.target.style.borderColor = 'var(--color-primary)';
    }
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!disabled && !error) {
      e.target.style.borderColor = 'var(--color-border-medium)';
    }
    onBlur?.();
  };

  return (
    <div className={className} style={{ marginBottom: 'var(--space-4)' }}>
      <label
        htmlFor={id}
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

      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            ...baseInputStyle,
            resize: 'vertical',
            minHeight: '80px'
          }}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={baseInputStyle}
        />
      )}

      {/* Contador de caracteres */}
      {maxLength && (
        <div style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          marginTop: 'var(--space-1)',
          textAlign: 'right'
        }}>
          {value.length}/{maxLength}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-error)',
          marginTop: 'var(--space-1)'
        }}>
          {error}
        </div>
      )}

      {/* Texto de ajuda */}
      {helpText && !error && (
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          marginTop: 'var(--space-1)'
        }}>
          {helpText}
        </div>
      )}
    </div>
  );
};
