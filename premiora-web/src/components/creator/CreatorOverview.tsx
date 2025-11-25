import React, { useEffect, useState } from 'react';
import { Users, UserPlus, UserMinus, TrendingUp, TrendingDown, Heart, MessageCircle, Eye, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AnalyticsService, type AnalyticsSummary, type DailyMetric } from '../../services/content/AnalyticsService';

const CreatorOverview: React.FC = () => {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (userProfile?.id) {
        try {
          setLoading(true);
          const [summaryData, dailyData] = await Promise.all([
            AnalyticsService.getCreatorSummary(userProfile.id),
            AnalyticsService.getDailyMetrics(userProfile.id)
          ]);
          setSummary(summaryData);
          setDailyMetrics(dailyData);
        } catch (error) {
          console.error("Failed to fetch analytics:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
  }, [userProfile?.id]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Carregando dados...
      </div>
    );
  }

  const formatGrowth = (val: number) => {
    if (val === 0) return '0%';
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val.toFixed(1)}%`;
  };

  const stats = [
    {
      label: 'Receita Total',
      value: `R$ ${summary?.totalRevenue.toFixed(2)}`,
      change: formatGrowth(summary?.revenueGrowth || 0),
      trend: (summary?.revenueGrowth || 0) >= 0 ? 'up' : 'down',
      icon: <TrendingUp size={24} className="text-purple-500" />,
      color: 'rgba(168, 85, 247, 0.1)'
    },
    {
      label: 'Membros Ativos',
      value: summary?.activeSubscribers || 0,
      change: formatGrowth(summary?.subscribersGrowth || 0),
      trend: (summary?.subscribersGrowth || 0) >= 0 ? 'up' : 'down',
      icon: <Crown size={24} className="text-yellow-500" />,
      color: 'rgba(234, 179, 8, 0.1)'
    },
    {
      label: 'Seguidores',
      value: summary?.totalFollowers || 0,
      change: formatGrowth(summary?.followersGrowth || 0),
      trend: (summary?.followersGrowth || 0) >= 0 ? 'up' : 'down',
      icon: <Users size={24} className="text-blue-500" />,
      color: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Visualizações',
      value: summary?.totalViews.toLocaleString() || 0,
      change: '-', // Cannot calculate view growth yet
      trend: 'up',
      icon: <Eye size={24} className="text-cyan-500" />,
      color: 'rgba(6, 182, 212, 0.1)'
    },
    {
      label: 'Curtidas',
      value: summary?.totalLikes.toLocaleString() || 0,
      change: formatGrowth(summary?.likesGrowth || 0),
      trend: (summary?.likesGrowth || 0) >= 0 ? 'up' : 'down',
      icon: <Heart size={24} className="text-red-500" />,
      color: 'rgba(239, 68, 68, 0.1)'
    },
    {
      label: 'Comentários',
      value: summary?.totalComments.toLocaleString() || 0,
      change: formatGrowth(summary?.commentsGrowth || 0),
      trend: (summary?.commentsGrowth || 0) >= 0 ? 'up' : 'down',
      icon: <MessageCircle size={24} className="text-green-500" />,
      color: 'rgba(34, 197, 94, 0.1)'
    },
    {
      label: 'Novos Membros (30d)',
      value: summary?.newSubscribers || 0,
      change: '',
      trend: 'up',
      icon: <UserPlus size={24} className="text-green-500" />,
      color: 'rgba(34, 197, 94, 0.1)'
    },
    {
      label: 'Cancelamentos (30d)',
      value: summary?.cancellations || 0,
      change: '',
      trend: 'down',
      icon: <UserMinus size={24} className="text-red-500" />,
      color: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <div className="creator-overview">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
        Visão Geral
      </h2>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid var(--color-border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                padding: '10px', 
                borderRadius: '10px', 
                backgroundColor: stat.color 
              }}>
                {stat.icon}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '0.875rem',
                color: stat.trend === 'up' ? 'var(--color-success)' : 'var(--color-error)',
                fontWeight: 500
              }}>
                {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.change}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section Placeholder - Now powered by real data structure */}
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--color-border-light)',
        height: '400px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            Crescimento de Membros
          </h3>
          <select style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border-light)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)'
          }}>
            <option>Últimos 30 dias</option>
            <option>Últimos 7 dias</option>
            <option>Este ano</option>
          </select>
        </div>
        
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          gap: '4px',
          paddingBottom: '20px'
        }}>
          {dailyMetrics.map((metric, i) => {
            // Calculate max value for scaling (min 5 to avoid division by zero or huge bars for low numbers)
            const maxVal = Math.max(5, ...dailyMetrics.map(m => m.newSubscribers));
            const height = (metric.newSubscribers / maxVal) * 100;
            
            return (
            <div key={i} style={{ 
              width: '100%', 
              height: `${height}%`, 
              backgroundColor: 'var(--color-primary)',
              opacity: 0.7,
              borderRadius: '4px 4px 0 0',
              position: 'relative',
              minHeight: '4px'
            }} title={`${metric.date}: ${metric.newSubscribers} novos membros`}>
            </div>
          )})}
        </div>
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
          Novos Membros Diários (Últimos 30 dias)
        </div>
      </div>
    </div>
  );
};

export default CreatorOverview;
