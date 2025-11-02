/**
 * Componente para item de configuração individual
 * Suporta diferentes tipos de controles (checkbox, select, button)
 */
import React from 'react';

/**
 * Props do componente SettingItem
 */
interface SettingItemProps {
  /** Rótulo da configuração */
  label: string;
  /** Descrição da configuração */
  description?: string;
  /** Tipo de controle */
  type?: 'checkbox' | 'select' | 'button';
  /** Valor para checkbox */
  checked?: boolean;
  /** Valor para select */
  value?: string;
  /** Opções para select */
  options?: Array<{ value: string; label: string }>;
  /** Texto do botão */
  buttonText?: string;
  /** Handler para mudança de valor */
  onChange?: (value: any) => void;
  /** Handler para clique no botão */
  onButtonClick?: () => void;
  /** Classe CSS adicional */
  className?: string;
  /** Indica se está desabilitado */
  disabled?: boolean;
}

/**
 * Componente SettingItem - Item individual de configuração
 */
export const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  type = 'checkbox',
  checked,
  value,
  options = [],
  buttonText,
  onChange,
  onButtonClick,
  className = '',
  disabled = false
}) => {
  const renderControl = () => {
    switch (type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'button':
        return (
          <button
            className="btn-secondary"
            onClick={onButtonClick}
            disabled={disabled}
          >
            {buttonText}
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`setting-item ${className}`}>
      <label className="setting-label">
        {type !== 'button' && <span>{label}</span>}
        {renderControl()}
        {type === 'button' && <span>{label}</span>}
      </label>
      {description && (
        <p className="setting-description">{description}</p>
      )}
    </div>
  );
};
