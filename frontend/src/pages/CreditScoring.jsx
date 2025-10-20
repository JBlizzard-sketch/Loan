import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Award } from 'lucide-react';
import { kechitaColors } from '../kechitaBrand';

function CreditScoring({ API_URL }) {
  const [customers, setCustomers] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customers?limit=100`);
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = async (customerId) => {
    setLoadingScore(true);
    try {
      const response = await fetch(`${API_URL}/api/credit-score/calculate?customer_id=${customerId}`, {
        method: 'POST'
      });
      const data = await response.json();
      setScores(prev => ({ ...prev, [customerId]: data }));
      setSelectedCustomer(data);
    } catch (error) {
      console.error('Error calculating score:', error);
    } finally {
      setLoadingScore(false);
    }
  };

  const getRiskColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'excellent': return kechitaColors.status.excellent;
      case 'good': return kechitaColors.status.good;
      case 'fair': return kechitaColors.status.warning;
      case 'poor': return kechitaColors.status.danger;
      case 'high risk': return kechitaColors.status.danger;
      default: return kechitaColors.text.secondary;
    }
  };

  const getRiskIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'excellent': return <Award size={20} />;
      case 'good': return <CheckCircle2 size={20} />;
      case 'fair': return <TrendingUp size={20} />;
      case 'poor': return <TrendingDown size={20} />;
      case 'high risk': return <AlertTriangle size={20} />;
      default: return null;
    }
  };

  const getScoreGrade = (score) => {
    if (score >= 750) return 'A+';
    if (score >= 700) return 'A';
    if (score >= 650) return 'B+';
    if (score >= 600) return 'B';
    if (score >= 550) return 'C+';
    if (score >= 500) return 'C';
    if (score >= 450) return 'D';
    return 'F';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (selectedRisk === 'all') return true;
    
    const score = scores[customer.customer_id];
    return score?.risk_category?.toLowerCase() === selectedRisk.toLowerCase();
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: kechitaColors.primary }}>Loading credit scoring...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: kechitaColors.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: kechitaColors.primary, margin: 0, marginBottom: '8px' }}>
          <Award style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
          Credit Scoring & Risk Assessment
        </h1>
        <p style={{ color: kechitaColors.text.secondary, margin: 0 }}>AI-Powered credit analysis using XGBoost machine learning</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.excellent}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} />
            Excellent Credit
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.excellent }}>
            {Object.values(scores).filter(s => s.risk_category === 'Excellent').length}
          </div>
          <div style={{ fontSize: '12px', color: kechitaColors.text.light, marginTop: '4px' }}>750-850 Score</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.good}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            Good Credit
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.good }}>
            {Object.values(scores).filter(s => s.risk_category === 'Good').length}
          </div>
          <div style={{ fontSize: '12px', color: kechitaColors.text.light, marginTop: '4px' }}>650-749 Score</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.warning}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} />
            Fair/Poor Credit
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.warning }}>
            {Object.values(scores).filter(s => s.risk_category === 'Fair' || s.risk_category === 'Poor').length}
          </div>
          <div style={{ fontSize: '12px', color: kechitaColors.text.light, marginTop: '4px' }}>450-649 Score</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.danger}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} />
            High Risk
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.danger }}>
            {Object.values(scores).filter(s => s.risk_category === 'High Risk').length}
          </div>
          <div style={{ fontSize: '12px', color: kechitaColors.text.light, marginTop: '4px' }}>Below 450 Score</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: kechitaColors.text.light }} size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: `2px solid ${kechitaColors.lightBlue}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            style={{
              padding: '12px 16px',
              border: `2px solid ${kechitaColors.lightBlue}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Risk Categories</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="high risk">High Risk</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCustomer ? '2fr 3fr' : '1fr', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', backgroundColor: kechitaColors.lightBlue, borderBottom: `2px solid ${kechitaColors.primary}` }}>
            <h2 style={{ margin: 0, color: kechitaColors.primary, fontSize: '18px', fontWeight: '600' }}>Customer List</h2>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredCustomers.map((customer) => (
              <div
                key={customer.customer_id}
                onClick={() => calculateScore(customer.customer_id)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  backgroundColor: selectedCustomer?.customer_id === customer.customer_id ? kechitaColors.lightBlue : 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = kechitaColors.lightBlue}
                onMouseLeave={(e) => {
                  if (selectedCustomer?.customer_id !== customer.customer_id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ fontWeight: '600', color: kechitaColors.text.primary, marginBottom: '4px' }}>{customer.name}</div>
                <div style={{ fontSize: '12px', color: kechitaColors.text.secondary }}>{customer.customer_id}</div>
                <div style={{ fontSize: '12px', color: kechitaColors.text.light }}>{customer.branch}</div>
                {scores[customer.customer_id] && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: `${getRiskColor(scores[customer.customer_id].risk_category)}20`,
                      color: getRiskColor(scores[customer.customer_id].risk_category)
                    }}>
                      {scores[customer.customer_id].credit_score} - {getScoreGrade(scores[customer.customer_id].credit_score)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedCustomer && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', backgroundColor: getRiskColor(selectedCustomer.risk_category), color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {getRiskIcon(selectedCustomer.risk_category)}
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{selectedCustomer.customer_name}</h2>
                  <p style={{ margin: 0, opacity: 0.9 }}>{selectedCustomer.customer_id}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{selectedCustomer.credit_score}</div>
                <div style={{ fontSize: '24px', opacity: 0.9 }}>/ 850</div>
                <div style={{ marginLeft: 'auto', fontSize: '32px', fontWeight: 'bold' }}>{getScoreGrade(selectedCustomer.credit_score)}</div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: '600' }}>{selectedCustomer.risk_category} Credit</div>
            </div>

            <div style={{ padding: '24px' }}>
              <h3 style={{ color: kechitaColors.primary, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Loan Recommendation</h3>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: kechitaColors.lightBlue, borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: kechitaColors.text.secondary, marginBottom: '4px' }}>Max Loan Amount</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: kechitaColors.primary }}>
                      KES {selectedCustomer.recommendation?.max_loan_amount?.toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: kechitaColors.lightBlue, borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: kechitaColors.text.secondary, marginBottom: '4px' }}>Interest Rate</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: kechitaColors.primary }}>
                      {selectedCustomer.recommendation?.recommended_interest_rate}%
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: kechitaColors.lightGreen, borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: kechitaColors.text.secondary, marginBottom: '4px' }}>Approval Likelihood</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: kechitaColors.secondary }}>
                    {selectedCustomer.recommendation?.approval_likelihood}
                  </div>
                </div>
              </div>

              <h4 style={{ color: kechitaColors.primary, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Recommendations</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: kechitaColors.text.secondary }}>
                {selectedCustomer.recommendation?.suggestions?.map((suggestion, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{suggestion}</li>
                ))}
              </ul>

              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
                <h4 style={{ color: kechitaColors.primary, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Credit Metrics</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: kechitaColors.background, borderRadius: '6px' }}>
                    <span style={{ color: kechitaColors.text.secondary }}>Collection Rate</span>
                    <span style={{ fontWeight: '600', color: kechitaColors.text.primary }}>
                      {selectedCustomer.features?.overall_collection_rate?.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: kechitaColors.background, borderRadius: '6px' }}>
                    <span style={{ color: kechitaColors.text.secondary }}>Total Loans</span>
                    <span style={{ fontWeight: '600', color: kechitaColors.text.primary }}>
                      {selectedCustomer.features?.total_loans}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: kechitaColors.background, borderRadius: '6px' }}>
                    <span style={{ color: kechitaColors.text.secondary }}>Completed Loans</span>
                    <span style={{ fontWeight: '600', color: kechitaColors.text.primary }}>
                      {selectedCustomer.features?.completed_loans_count}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: kechitaColors.background, borderRadius: '6px' }}>
                    <span style={{ color: kechitaColors.text.secondary }}>Overdue Loans</span>
                    <span style={{ fontWeight: '600', color: kechitaColors.status.danger }}>
                      {selectedCustomer.features?.overdue_loans_count}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: kechitaColors.background, borderRadius: '6px' }}>
                    <span style={{ color: kechitaColors.text.secondary }}>Customer Tenure</span>
                    <span style={{ fontWeight: '600', color: kechitaColors.text.primary }}>
                      {Math.floor(selectedCustomer.features?.customer_tenure_days / 30)} months
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loadingScore && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', color: kechitaColors.primary, marginBottom: '8px' }}>Calculating Credit Score...</div>
            <div style={{ fontSize: '14px', color: kechitaColors.text.secondary }}>Analyzing payment history & risk factors</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditScoring;
