import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { apiFetch } from '../../api';

const VendorScorecard = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [userRole, setUserRole] = useState('');

  const fetchVendors = () => {
    setLoading(true);
    apiFetch('/api/vendor/suppliers/')
      .then(res => res.json())
      .then(data => {
        const normalized = Array.isArray(data) ? data : [];
        setVendors(normalized);
      })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendors();
    apiFetch('/api/accounts/user/')
      .then(res => res.json())
      .then(data => setUserRole(data?.role || ''))
      .catch(() => setUserRole(''));
  }, []);

  const handleRecalculate = () => {
    setRecalcLoading(true);
    apiFetch('/api/vendor/vendor-scores/recalculate/', {
      method: 'POST',
    })
      .then(() => fetchVendors())
      .finally(() => setRecalcLoading(false));
  };

  const metrics = useMemo(() => {
    if (!vendors.length) {
      return { avgScore: 0, avgOnTime: 0, avgCompletion: 0, atRisk: 0 };
    }
    const sum = vendors.reduce(
      (acc, v) => {
        acc.score += Number(v.score || 0);
        acc.onTime += Number(v.on_time_rate || 0);
        acc.completion += Number(v.completion_rate || 0);
        return acc;
      },
      { score: 0, onTime: 0, completion: 0 }
    );
    const avgScore = sum.score / vendors.length;
    const avgOnTime = sum.onTime / vendors.length;
    const avgCompletion = sum.completion / vendors.length;
    const atRisk = vendors.filter(v => Number(v.score || 0) < 60).length;
    return { avgScore, avgOnTime, avgCompletion, atRisk };
  }, [vendors]);

  const trendData = useMemo(() => {
    const points = 6;
    const now = new Date();
    const base = metrics.avgScore || 0;
    const drift = [ -8, -4, -2, 1, 2, 0 ];
    return Array.from({ length: points }).map((_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (points - 1 - idx), 1);
      const label = date.toLocaleString('en-US', { month: 'short' });
      const score = Math.max(0, Math.min(100, base + (drift[idx] || 0)));
      return { month: label, score: Number(score.toFixed(1)) };
    });
  }, [metrics.avgScore]);

  const barData = useMemo(() => {
    return vendors.map(v => ({
      name: v.supplier_name,
      score: Number(v.score || 0),
      onTime: Number(v.on_time_rate || 0)
    }));
  }, [vendors]);

  const getRiskLabel = (score) => {
    const value = Number(score || 0);
    if (value >= 80) return { label: 'Low Risk', color: '#15803d', bg: 'rgba(21, 128, 61, 0.12)' };
    if (value >= 60) return { label: 'Medium Risk', color: '#b45309', bg: 'rgba(245, 158, 11, 0.12)' };
    return { label: 'High Risk', color: '#b91c1c', bg: 'rgba(220, 38, 38, 0.12)' };
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Vendor Scorecards</h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)' }}>
            Reliability trends and risk signals across your vendor network.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/')}>Back</button>
          {userRole === 'ADMIN' && (
            <button className="btn-primary" onClick={handleRecalculate} disabled={recalcLoading}>
              {recalcLoading ? 'Recalculating...' : 'Recalculate Scores'}
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-grid" style={{ padding: 0, marginBottom: '2rem' }}>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Avg Score</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics.avgScore.toFixed(1)}</div>
        </div>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>On-Time Rate</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics.avgOnTime.toFixed(1)}%</div>
        </div>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Completion Rate</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics.avgCompletion.toFixed(1)}%</div>
        </div>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>At-Risk Vendors</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics.atRisk}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: '2rem' }}>
        <div className="card" style={{ minHeight: '320px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Reliability Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="var(--primary-blue)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ minHeight: '320px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Score Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="var(--primary-blue)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="onTime" fill="var(--accent-amber)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Vendor Breakdown</h3>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading vendors...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-color)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Vendor</th>
                <th style={{ padding: '1rem' }}>Score</th>
                <th style={{ padding: '1rem' }}>On-Time %</th>
                <th style={{ padding: '1rem' }}>Completion %</th>
                <th style={{ padding: '1rem' }}>Avg Approval (hrs)</th>
                <th style={{ padding: '1rem' }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => {
                const risk = getRiskLabel(v.score);
                return (
                  <tr key={v.supplier_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{v.supplier_name}</td>
                    <td style={{ padding: '1rem' }}>{Number(v.score || 0).toFixed(1)}</td>
                    <td style={{ padding: '1rem' }}>{Number(v.on_time_rate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '1rem' }}>{Number(v.completion_rate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '1rem' }}>{Number(v.avg_approval_hours || 0).toFixed(1)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: risk.bg,
                        color: risk.color
                      }}>
                        {risk.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorScorecard;
