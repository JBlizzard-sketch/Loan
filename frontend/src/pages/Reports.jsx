import { useState, useEffect } from 'react';
import { FileText, TrendingUp, DollarSign, AlertCircle, PieChart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { kechitaColors } from '../kechitaBrand';

function Reports({ API_URL }) {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioAnalysis();
  }, []);

  const fetchPortfolioAnalysis = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/portfolio-analysis`);
      const data = await response.json();
      setPortfolioData(data);
    } catch (error) {
      console.error('Error fetching portfolio analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !portfolioData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: kechitaColors.primary }}>Loading reports...</div>
      </div>
    );
  }

  const statusData = Object.entries(portfolioData.by_status?.disbursement_amount || {}).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: value,
    count: portfolioData.by_status?.loan_id?.[status] || 0
  }));

  const regionData = Object.entries(portfolioData.by_region?.disbursement_amount || {}).map(([region, value]) => ({
    region: region,
    disbursement: value,
    loans: portfolioData.by_region?.loan_id?.[region] || 0
  }));

  const COLORS = [kechitaColors.status.excellent, kechitaColors.status.info, kechitaColors.status.danger, kechitaColors.status.warning];

  return (
    <div style={{ padding: '24px', backgroundColor: kechitaColors.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: kechitaColors.primary, margin: 0, marginBottom: '8px' }}>
          <FileText style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
          Portfolio Analysis & Reports
        </h1>
        <p style={{ color: kechitaColors.text.secondary, margin: 0 }}>Comprehensive insights into loan portfolio performance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.primary}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <DollarSign size={24} style={{ color: kechitaColors.primary }} />
            <div style={{ fontSize: '14px', color: kechitaColors.text.secondary }}>Total Portfolio Value</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.primary }}>
            KES {(portfolioData.total_portfolio_value / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '12px', color: kechitaColors.text.light, marginTop: '4px' }}>
            {portfolioData.total_loans} loans across {portfolioData.total_branches} branches
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.excellent}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <TrendingUp size={24} style={{ color: kechitaColors.status.excellent }} />
            <div style={{ fontSize: '14px', color: kechitaColors.text.secondary }}>Collections</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.excellent }}>
            KES {(portfolioData.total_collected / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '12px', color: kechitaColors.text.light, marginTop: '4px' }}>
            Collection Rate: {portfolioData.collection_rate}%
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.danger}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle size={24} style={{ color: kechitaColors.status.danger }} />
            <div style={{ fontSize: '14px', color: kechitaColors.text.secondary }}>Portfolio at Risk</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.danger }}>
            KES {(portfolioData.portfolio_at_risk / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '12px', color: kechitaColors.text.light, marginTop: '4px' }}>
            PAR Ratio: {portfolioData.par_ratio}%
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: kechitaColors.primary, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} />
            Portfolio by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `KES ${(value / 1000000).toFixed(2)}M`} />
            </RePieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px' }}>
            {statusData.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: index % 2 === 0 ? kechitaColors.background : 'white', borderRadius: '6px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span style={{ color: kechitaColors.text.primary }}>{item.name}</span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: kechitaColors.text.primary }}>
                    {item.count} loans
                  </span>
                  <span style={{ color: kechitaColors.text.light, marginLeft: '8px', fontSize: '12px' }}>
                    KES {(item.value / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: kechitaColors.primary, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} />
            Top Regions by Disbursement
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => `KES ${(value / 1000000).toFixed(2)}M`} />
              <Bar dataKey="disbursement" fill={kechitaColors.primary} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px' }}>
            {regionData.slice(0, 5).map((item, index) => (
              <div key={item.region} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: index % 2 === 0 ? kechitaColors.background : 'white', borderRadius: '6px', marginBottom: '4px' }}>
                <span style={{ color: kechitaColors.text.primary, fontWeight: '500' }}>{item.region}</span>
                <div>
                  <span style={{ fontWeight: '600', color: kechitaColors.primary }}>
                    KES {(item.disbursement / 1000000).toFixed(1)}M
                  </span>
                  <span style={{ color: kechitaColors.text.light, marginLeft: '8px', fontSize: '12px' }}>
                    {item.loans} loans
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: kechitaColors.primary, marginBottom: '16px' }}>
          Key Performance Indicators
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: kechitaColors.lightBlue, borderRadius: '8px', borderLeft: `4px solid ${kechitaColors.primary}` }}>
            <div style={{ fontSize: '12px', color: kechitaColors.text.secondary, marginBottom: '4px' }}>Average Loan Size</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: kechitaColors.primary }}>
              KES {Math.round(portfolioData.total_portfolio_value / portfolioData.total_loans).toLocaleString()}
            </div>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: kechitaColors.lightGreen, borderRadius: '8px', borderLeft: `4px solid ${kechitaColors.secondary}` }}>
            <div style={{ fontSize: '12px', color: kechitaColors.text.secondary, marginBottom: '4px' }}>Collection Efficiency</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: kechitaColors.secondary }}>
              {portfolioData.collection_rate}%
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#FFF4E6', borderRadius: '8px', borderLeft: `4px solid ${kechitaColors.status.warning}` }}>
            <div style={{ fontSize: '12px', color: kechitaColors.text.secondary, marginBottom: '4px' }}>Risk Exposure</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: kechitaColors.status.warning }}>
              {portfolioData.par_ratio}%
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#FFE5E5', borderRadius: '8px', borderLeft: `4px solid ${kechitaColors.status.danger}` }}>
            <div style={{ fontSize: '12px', color: kechitaColors.text.secondary, marginBottom: '4px' }}>Outstanding Amount</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: kechitaColors.status.danger }}>
              KES {((portfolioData.total_portfolio_value - portfolioData.total_collected) / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
