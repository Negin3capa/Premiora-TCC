/**
 * Hook personalizado para gerenciar conexão WebSocket
 * Responsável por conexão, reconexão, autenticação e eventos em tempo real
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface WebSocketMessage {
  type: string;
  payload?: any;
}

export interface WebSocketHook {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  send: (message: WebSocketMessage) => void;
}

/**
 * Hook para gerenciar conexão WebSocket com reconexão automática
 * @param url - URL do servidor WebSocket (opcional, usa padrão se não fornecido)
 * @returns Interface para interação com WebSocket
 */
export const useWebSocket = (url?: string): WebSocketHook => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const reconnectTimeoutRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 segundo

  // URL padrão do WebSocket
  const wsUrl = url || `wss://${window.location.host}/ws`;

  /**
   * Calcula delay exponencial para reconexão
   * @param attempt - Número da tentativa
   * @returns Delay em milissegundos
   */
  const getReconnectDelay = useCallback((attempt: number): number => {
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000); // Máximo 30 segundos
  }, []);

  /**
   * Limpa timers de reconexão e heartbeat
   */
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  /**
   * Inicia heartbeat para manter conexão viva
   */
  const startHeartbeat = useCallback(() => {
    clearTimers();
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping a cada 30 segundos
  }, [socket, clearTimers]);

  /**
   * Conecta ao servidor WebSocket
   */
  const connect = useCallback(() => {
    if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) {
      return;
    }

    setIsConnecting(true);
    setLastError(null);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('📡 WebSocket conectado');
        setIsConnected(true);
        setIsConnecting(false);
        setLastError(null);
        reconnectAttemptsRef.current = 0;

        // Enviar mensagem de autenticação se usuário estiver logado
        if (user?.id) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            payload: {
              userId: user.id,
              token: localStorage.getItem('authToken') // Assumindo que o token está armazenado
            }
          }));
        }

        // Iniciar heartbeat
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Responder a pings do servidor
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
            return;
          }

          // Log de mensagens recebidas (exceto heartbeats)
          if (message.type !== 'pong') {
            console.log('📨 WebSocket message:', message);
          }

          // As mensagens são tratadas pelos componentes que usam o hook
          // através de event listeners adicionados ao socket
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('📡 WebSocket desconectado:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        setSocket(null);
        clearTimers();

        // Tentar reconexão se não foi fechamento intencional
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = getReconnectDelay(reconnectAttemptsRef.current);
          console.log(`🔄 Tentando reconexão em ${delay}ms (tentativa ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setLastError('Falha ao reconectar após múltiplas tentativas');
        }
      };

      ws.onerror = (error) => {
        console.error('📡 Erro WebSocket:', error);
        setLastError('Erro de conexão WebSocket');
        setIsConnecting(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Erro ao criar conexão WebSocket:', error);
      setIsConnecting(false);
      setLastError('Erro ao estabelecer conexão');
    }
  }, [wsUrl, user?.id, isConnecting, socket, startHeartbeat, getReconnectDelay, clearTimers]);

  /**
   * Desconecta do servidor WebSocket
   */
  const disconnect = useCallback(() => {
    clearTimers();
    if (socket) {
      socket.close(1000, 'Client disconnect');
      setSocket(null);
    }
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, [socket, clearTimers]);

  /**
   * Envia mensagem para o servidor WebSocket
   * @param message - Mensagem a ser enviada
   */
  const send = useCallback((message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Tentativa de enviar mensagem com WebSocket desconectado');
    }
  }, [socket]);

  // Conectar automaticamente quando o componente montar e usuário estiver disponível
  useEffect(() => {
    if (user?.id && !socket) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  // Reconectar se a conexão cair e ainda houver usuário
  useEffect(() => {
    if (!isConnected && !isConnecting && user?.id && reconnectAttemptsRef.current < maxReconnectAttempts) {
      const delay = getReconnectDelay(reconnectAttemptsRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    }
  }, [isConnected, isConnecting, user?.id, connect, getReconnectDelay]);

  return {
    socket,
    isConnected,
    isConnecting,
    lastError,
    send
  };
};
