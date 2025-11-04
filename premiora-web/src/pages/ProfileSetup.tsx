import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AtSign, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useProfileSetup } from '../hooks/useProfileSetup';
import { useAuth } from '../hooks/useAuth';

/**
 * Página de configuração inicial do perfil do usuário
 * Aparece após o primeiro login quando name e username não estão definidos
 */
const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    name,
    setName,
    username,
    setUsername,
    isSubmitting,
    submitError,
    submitSuccess,
    usernameValidation,
    saveProfile,
    isProfileComplete,
  } = useProfileSetup();

  // Redirecionamentos baseados no estado de autenticação
  useEffect(() => {
    // Aguardar carregamento da autenticação
    if (authLoading) return;

    // Se não há usuário autenticado, redirecionar para login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Se perfil já está completo, redirecionar para dashboard
    if (isProfileComplete()) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, authLoading, isProfileComplete, navigate]);

  // Preencher automaticamente dados do OAuth se disponível
  useEffect(() => {
    if (user && !name && user.user_metadata) {
      const oauthName = user.user_metadata.full_name ||
                       user.user_metadata.name ||
                       user.user_metadata.preferred_username ||
                       user.email?.split('@')[0];

      if (oauthName) {
        console.log('🔄 Preenchendo nome automaticamente do OAuth:', oauthName);
        setName(oauthName);
      }
    }
  }, [user, name, setName]);

  // Redirecionar após sucesso
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, navigate]);

  /**
   * Handler para submit do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveProfile();
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao salvar perfil:', error);
    }
  };

  /**
   * Verifica se o formulário pode ser enviado
   */
  const canSubmit = (): boolean => {
    return (
      name.trim().length >= 2 &&
      usernameValidation.isValid &&
      usernameValidation.isAvailable &&
      !isSubmitting &&
      !submitSuccess
    );
  };

  // Loading state
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
      }}>
        <Loader className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '480px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: '0 0 8px 0',
          }}>
            Configure seu perfil
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: '1.5',
          }}>
            Complete seu perfil para começar a usar o Premiora
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #16a34a',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <CheckCircle size={20} color="#16a34a" />
            <span style={{ color: '#16a34a', fontWeight: '500' }}>
              Perfil configurado com sucesso! Redirecionando...
            </span>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #dc2626',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <XCircle size={20} color="#dc2626" />
            <span style={{ color: '#dc2626', fontSize: '14px' }}>
              {submitError}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}>
              Nome de exibição
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={20}
                color="var(--color-text-secondary)"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: name.trim().length >= 2
                    ? '2px solid #16a34a'
                    : '2px solid var(--color-border-light)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                disabled={isSubmitting || submitSuccess}
                required
                minLength={2}
              />
            </div>
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              margin: '4px 0 0 0',
            }}>
              Mínimo 2 caracteres
            </p>
          </div>

          {/* Username Field */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <AtSign
                size={20}
                color="var(--color-text-secondary)"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu_username"
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: usernameValidation.isValid && usernameValidation.isAvailable
                    ? '2px solid #16a34a'
                    : usernameValidation.error
                    ? '2px solid #dc2626'
                    : '2px solid var(--color-border-light)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                disabled={isSubmitting || submitSuccess}
                required
              />

              {/* Status Icon */}
              {username.trim() && (
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}>
                  {usernameValidation.isChecking ? (
                    <Loader size={20} className="animate-spin" color="var(--color-text-secondary)" />
                  ) : usernameValidation.isValid && usernameValidation.isAvailable ? (
                    <CheckCircle size={20} color="#16a34a" />
                  ) : usernameValidation.error ? (
                    <XCircle size={20} color="#dc2626" />
                  ) : null}
                </div>
              )}
            </div>

            {/* Username Status */}
            {username.trim() && (
              <div style={{ marginTop: '8px' }}>
                {usernameValidation.isChecking && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Loader size={14} className="animate-spin" />
                    Verificando disponibilidade...
                  </p>
                )}
                {usernameValidation.error && (
                  <p style={{
                    fontSize: '14px',
                    color: '#dc2626',
                    margin: 0,
                  }}>
                    {usernameValidation.error}
                  </p>
                )}
                {usernameValidation.isValid && usernameValidation.isAvailable && (
                  <p style={{
                    fontSize: '14px',
                    color: '#16a34a',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <CheckCircle size={14} />
                    @{username} está disponível
                  </p>
                )}
              </div>
            )}

            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              margin: '4px 0 0 0',
            }}>
              3-20 caracteres. Apenas letras, números, pontos e underscores.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit()}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: canSubmit() ? 'var(--color-primary)' : 'var(--color-border-light)',
              color: canSubmit() ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: canSubmit() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader size={20} className="animate-spin" />
                Salvando...
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle size={20} />
                Salvo!
              </>
            ) : (
              'Salvar perfil'
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          margin: '24px 0 0 0',
          lineHeight: '1.5',
        }}>
          Seu username será usado para seu perfil público e deve ser único em toda a plataforma.
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;
