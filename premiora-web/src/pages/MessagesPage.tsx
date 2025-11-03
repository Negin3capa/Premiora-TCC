/**
 * Página de mensagens
 * Exibe conversas e mensagens diretas do usuário
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import '../styles/HomePage.css';

/**
 * Página de mensagens do usuário
 * Mostra lista de conversas e interface de chat
 */
const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileChatView, setIsMobileChatView] = useState(false);

  /**
   * Handler para alternar visibilidade da sidebar em dispositivos móveis
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Mock conversations data
  const mockConversations = [
    {
      id: '1',
      user: {
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
        online: true
      },
      lastMessage: 'Oi! Vi seu post sobre React, muito bom!',
      timestamp: '2h atrás',
      unread: true,
      unreadCount: 2
    },
    {
      id: '2',
      user: {
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=40&h=40&fit=crop&crop=face&auto=format',
        online: false
      },
      lastMessage: 'Obrigada pelo feedback no meu projeto!',
      timestamp: '1d atrás',
      unread: false,
      unreadCount: 0
    },
    {
      id: '3',
      user: {
        name: 'Carlos Oliveira',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format',
        online: true
      },
      lastMessage: 'Vamos colaborar naquele projeto?',
      timestamp: '3d atrás',
      unread: true,
      unreadCount: 1
    }
  ];

  // Mock messages for selected conversation
  const mockMessages = selectedConversation ? [
    {
      id: '1',
      sender: 'João Silva',
      content: 'Oi! Vi seu post sobre React, muito bom!',
      timestamp: '2h atrás',
      isOwn: false
    },
    {
      id: '2',
      sender: 'Você',
      content: 'Obrigado! Fico feliz que tenha gostado.',
      timestamp: '2h atrás',
      isOwn: true
    },
    {
      id: '3',
      sender: 'João Silva',
      content: 'Você poderia compartilhar mais detalhes sobre como implementou os hooks customizados?',
      timestamp: '1h atrás',
      isOwn: false
    }
  ] : [];

  const selectedConversationData = mockConversations.find(conv => conv.id === selectedConversation);

  return (
    <div className="homepage">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onToggleSidebar={toggleSidebar}
        />

        <div className="messages-layout">
          {/* Conversations List */}
          <div className={`conversations-sidebar ${isMobileChatView ? 'hidden' : ''}`}>
            <div className="conversations-header">
              <h2>Mensagens</h2>
              <button className="new-message-button" title="Nova mensagem">
                ✏️
              </button>
            </div>

            <div className="conversations-list">
              {mockConversations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <h3>Nenhuma conversa</h3>
                  <p>Comece uma conversa enviando uma mensagem para alguém.</p>
                </div>
              ) : (
                mockConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${selectedConversation === conversation.id ? 'active' : ''} ${conversation.unread ? 'unread' : ''}`}
                    onClick={() => {
                      setSelectedConversation(conversation.id);
                      setIsMobileChatView(true);
                    }}
                  >
                    <div className="conversation-avatar">
                      <img
                        src={conversation.user.avatar}
                        alt={conversation.user.name}
                        className="avatar-image"
                      />
                      {conversation.user.online && (
                        <div className="online-indicator"></div>
                      )}
                    </div>

                    <div className="conversation-content">
                      <div className="conversation-header">
                        <span className="conversation-name">{conversation.user.name}</span>
                        <span className="conversation-time">{conversation.timestamp}</span>
                      </div>
                      <div className="conversation-preview">
                        <span className="last-message">{conversation.lastMessage}</span>
                        {conversation.unread && conversation.unreadCount > 0 && (
                          <span className="unread-badge">{conversation.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`chat-area ${isMobileChatView ? 'visible' : ''}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-user-info">
                    <button
                      className="back-button"
                      onClick={() => setIsMobileChatView(false)}
                      title="Voltar para conversas"
                    >
                      ←
                    </button>
                    <img
                      src={selectedConversationData?.user.avatar}
                      alt={selectedConversationData?.user.name}
                      className="chat-avatar"
                    />
                    <div>
                      <h3 className="chat-user-name">{selectedConversationData?.user.name}</h3>
                      <span className={`chat-status ${selectedConversationData?.user.online ? 'online' : 'offline'}`}>
                        {selectedConversationData?.user.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button className="chat-action-button" title="Mais opções">
                      ⋯
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-container">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.isOwn ? 'own' : 'other'}`}
                    >
                      <div className="message-content">
                        <p className="message-text">{message.content}</p>
                        <span className="message-time">{message.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="message-input-container">
                  <div className="message-input-wrapper">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      className="message-input"
                    />
                    <button className="send-button" title="Enviar">
                      📤
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <div className="empty-icon">💬</div>
                <h3>Selecione uma conversa</h3>
                <p>Escolha uma conversa da lista para começar a conversar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default MessagesPage;
