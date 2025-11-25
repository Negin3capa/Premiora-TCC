import React, { useEffect, useState } from 'react';
import { Users, Crown, TrendingUp, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SubscribersService, type Subscriber } from '../../services/content/SubscribersService';
import '../../styles/CreatorSubscribers.css';

const CreatorSubscribers: React.FC = () => {
    const { userProfile } = useAuth();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        cancelled: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');

    useEffect(() => {
        const fetchSubscribers = async () => {
            if (userProfile?.id) {
                try {
                    setLoading(true);
                    const [subscribersData, statsData] = await Promise.all([
                        SubscribersService.getCreatorSubscribers(userProfile.id),
                        SubscribersService.getSubscriberStats(userProfile.id)
                    ]);
                    setSubscribers(subscribersData);
                    setStats(statsData);
                } catch (error) {
                    console.error('Erro ao buscar assinantes:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSubscribers();
    }, [userProfile?.id]);

    if (loading) {
        return (
            <div className="subscribers-loading">
                <div className="loading-spinner"></div>
                <p>Carregando assinantes...</p>
            </div>
        );
    }

    const filteredSubscribers = subscribers.filter(sub => {
        if (filter === 'all') return true;
        return sub.status === filter;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Ativo', icon: CheckCircle, color: 'var(--color-success)' },
            cancelled: { label: 'Cancelado', icon: XCircle, color: 'var(--color-error)' },
            expired: { label: 'Expirado', icon: XCircle, color: 'var(--color-text-tertiary)' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
        const Icon = config.icon;

        return (
            <span className="status-badge" style={{ color: config.color }}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    const statsCards = [
        {
            label: 'Total de Assinantes',
            value: stats.total,
            icon: <Users size={24} />,
            color: 'rgba(59, 130, 246, 0.1)',
            iconColor: '#3b82f6'
        },
        {
            label: 'Assinantes Ativos',
            value: stats.active,
            icon: <Crown size={24} />,
            color: 'rgba(234, 179, 8, 0.1)',
            iconColor: '#eab308'
        },
        {
            label: 'Receita Mensal',
            value: `R$ ${stats.monthlyRevenue.toFixed(2)}`,
            icon: <DollarSign size={24} />,
            color: 'rgba(34, 197, 94, 0.1)',
            iconColor: '#22c55e'
        },
        {
            label: 'Cancelamentos',
            value: stats.cancelled,
            icon: <TrendingUp size={24} />,
            color: 'rgba(239, 68, 68, 0.1)',
            iconColor: '#ef4444'
        }
    ];

    return (
        <div className="creator-subscribers">
            <div className="subscribers-header">
                <h2>Assinantes</h2>
                <p className="subscribers-subtitle">
                    Gerencie e visualize todos os seus assinantes
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-card-header">
                            <div
                                className="stat-icon"
                                style={{ backgroundColor: stat.color, color: stat.iconColor }}
                            >
                                {stat.icon}
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="subscribers-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos ({subscribers.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Ativos ({stats.active})
                </button>
                <button
                    className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilter('cancelled')}
                >
                    Cancelados ({stats.cancelled})
                </button>
            </div>

            {/* Subscribers List */}
            <div className="subscribers-list">
                {filteredSubscribers.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} />
                        <h3>Nenhum assinante encontrado</h3>
                        <p>
                            {filter === 'all'
                                ? 'Você ainda não possui assinantes.'
                                : `Nenhum assinante ${filter === 'active' ? 'ativo' : 'cancelado'} no momento.`}
                        </p>
                    </div>
                ) : (
                    <div className="subscribers-table">
                        <div className="table-header">
                            <div className="table-cell">Assinante</div>
                            <div className="table-cell">Plano</div>
                            <div className="table-cell">Valor</div>
                            <div className="table-cell">Data de Assinatura</div>
                            <div className="table-cell">Status</div>
                        </div>
                        {filteredSubscribers.map((subscriber) => (
                            <div key={subscriber.id} className="table-row">
                                <div className="table-cell subscriber-info">
                                    <div className="subscriber-avatar">
                                        {subscriber.userAvatar ? (
                                            <img src={subscriber.userAvatar} alt={subscriber.userName} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {subscriber.userName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="subscriber-name">{subscriber.userName}</span>
                                </div>
                                <div className="table-cell">
                                    <span className="tier-badge">{subscriber.tierName}</span>
                                </div>
                                <div className="table-cell">
                                    <span className="price">R$ {subscriber.tierPrice.toFixed(2)}</span>
                                </div>
                                <div className="table-cell">
                                    <span className="date">
                                        <Calendar size={14} />
                                        {formatDate(subscriber.subscribedAt)}
                                    </span>
                                </div>
                                <div className="table-cell">
                                    {getStatusBadge(subscriber.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorSubscribers;
