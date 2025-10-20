import { useState, useEffect } from 'react';
import { Search, Download, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { kechitaColors } from '../kechitaBrand';

function Loans({ API_URL }) {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, overdue: 0 });

  useEffect(() => {
    fetchLoans();
    fetchBranches();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [searchTerm, selectedBranch, selectedStatus, loans]);

  const fetchLoans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/loans?limit=500`);
      const data = await response.json();
      const loansData = data.loans || [];
      setLoans(loansData);
      
      setStats({
        total: data.total || 0,
        active: loansData.filter(l => l.status === 'active').length,
        completed: loansData.filter(l => l.status === 'completed').length,
        overdue: loansData.filter(l => l.status === 'overdue').length
      });
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_URL}/api/branches`);
      const data = await response.json();
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.loan_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(loan => loan.branch === selectedBranch);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(loan => loan.status === selectedStatus);
    }

    setFilteredLoans(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return kechitaColors.status.excellent;
      case 'active': return kechitaColors.status.info;
      case 'overdue': return kechitaColors.status.danger;
      default: return kechitaColors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'active': return <Clock size={16} />;
      case 'overdue': return <AlertCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Loan ID', 'Customer ID', 'Customer Name', 'Branch', 'Amount', 'Disbursement Date', 'Due Date', 'Status'];
    const csvData = filteredLoans.map(l => [
      l.loan_id, l.customer_id, l.customer_name, l.branch, l.disbursement_amount, 
      l.disbursement_date, l.due_date, l.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kechita_loans.csv';
    a.click();
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: kechitaColors.primary }}>Loading loans...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: kechitaColors.background, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: kechitaColors.primary, margin: 0 }}>
          <FileText style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
          Loan Portfolio
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.primary}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px' }}>Total Loans</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.primary }}>{stats.total.toLocaleString()}</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.info}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            Active
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.info }}>{stats.active.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.excellent}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} />
            Completed
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.excellent }}>{stats.completed.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.danger}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            Overdue
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: kechitaColors.status.danger }}>{stats.overdue.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: kechitaColors.text.light }} size={20} />
            <input
              type="text"
              placeholder="Search by loan ID, customer name, or ID..."
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
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{
              padding: '12px 16px',
              border: `2px solid ${kechitaColors.lightBlue}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch.branch} value={branch.branch}>{branch.branch}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              border: `2px solid ${kechitaColors.lightBlue}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <button
            onClick={exportToCSV}
            style={{
              padding: '12px 24px',
              backgroundColor: kechitaColors.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: kechitaColors.lightBlue }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Loan ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Customer</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Branch</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: kechitaColors.primary }}>Amount (KES)</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Disbursed</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Due Date</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: kechitaColors.primary }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.slice(0, 100).map((loan, index) => (
                <tr 
                  key={loan.loan_id}
                  style={{
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: index % 2 === 0 ? 'white' : kechitaColors.background
                  }}
                >
                  <td style={{ padding: '16px', color: kechitaColors.primary, fontWeight: '600' }}>{loan.loan_id}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: kechitaColors.text.primary, fontWeight: '500' }}>{loan.customer_name}</div>
                    <div style={{ color: kechitaColors.text.light, fontSize: '12px' }}>{loan.customer_id}</div>
                  </td>
                  <td style={{ padding: '16px', color: kechitaColors.text.secondary }}>{loan.branch}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: kechitaColors.text.primary, fontWeight: '600' }}>
                    {loan.disbursement_amount?.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', color: kechitaColors.text.secondary }}>{loan.disbursement_date}</td>
                  <td style={{ padding: '16px', color: kechitaColors.text.secondary }}>{loan.due_date}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: `${getStatusColor(loan.status)}20`,
                      color: getStatusColor(loan.status)
                    }}>
                      {getStatusIcon(loan.status)}
                      {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLoans.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: kechitaColors.text.light }}>
            No loans found matching your criteria
          </div>
        )}
        
        {filteredLoans.length > 100 && (
          <div style={{ padding: '16px', textAlign: 'center', backgroundColor: kechitaColors.lightBlue, color: kechitaColors.primary }}>
            Showing 100 of {filteredLoans.length} loans
          </div>
        )}
      </div>
    </div>
  );
}

export default Loans;
