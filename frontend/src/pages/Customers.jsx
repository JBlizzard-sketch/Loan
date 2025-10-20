import { useState, useEffect } from 'react';
import { Search, Download, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { kechitaColors } from '../kechitaBrand';

function Customers({ API_URL }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, highValue: 0 });

  useEffect(() => {
    fetchCustomers();
    fetchBranches();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, selectedBranch, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customers?limit=500`);
      const data = await response.json();
      setCustomers(data.customers || []);
      
      setStats({
        total: data.total || 0,
        active: data.customers?.length || 0,
        highValue: data.customers?.filter(c => c.customer_id).length || 0
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
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

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      );
    }

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(customer => customer.branch === selectedBranch);
    }

    setFilteredCustomers(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Customer ID', 'Name', 'Phone', 'Branch', 'Region', 'Registration Date'];
    const csvData = filteredCustomers.map(c => [
      c.customer_id, c.name, c.phone, c.branch, c.region, c.registration_date
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kechita_customers.csv';
    a.click();
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: kechitaColors.primary }}>Loading customers...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: kechitaColors.background, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: kechitaColors.primary, margin: 0 }}>
          <Users style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
          Customer Management
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.primary}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px' }}>Total Customers</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: kechitaColors.primary }}>{stats.total.toLocaleString()}</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.secondary}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px' }}>Active Customers</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: kechitaColors.secondary }}>{stats.active.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${kechitaColors.status.info}` }}>
          <div style={{ fontSize: '14px', color: kechitaColors.text.secondary, marginBottom: '8px' }}>Registered</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: kechitaColors.status.info }}>{stats.highValue.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: kechitaColors.text.light }} size={20} />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
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
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Customer ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Phone</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Branch</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Region</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: kechitaColors.primary }}>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.slice(0, 100).map((customer, index) => (
                <tr 
                  key={customer.customer_id}
                  style={{
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: index % 2 === 0 ? 'white' : kechitaColors.background
                  }}
                >
                  <td style={{ padding: '16px', color: kechitaColors.primary, fontWeight: '600' }}>{customer.customer_id}</td>
                  <td style={{ padding: '16px', color: kechitaColors.text.primary }}>{customer.name}</td>
                  <td style={{ padding: '16px', color: kechitaColors.text.secondary }}>{customer.phone}</td>
                  <td style={{ padding: '16px', color: kechitaColors.text.secondary }}>{customer.branch}</td>
                  <td style={{ padding: '16px', color: kechitaColors.text.secondary }}>{customer.region}</td>
                  <td style={{ padding: '16px', color: kechitaColors.text.secondary }}>{customer.registration_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: kechitaColors.text.light }}>
            No customers found matching your criteria
          </div>
        )}
        
        {filteredCustomers.length > 100 && (
          <div style={{ padding: '16px', textAlign: 'center', backgroundColor: kechitaColors.lightBlue, color: kechitaColors.primary }}>
            Showing 100 of {filteredCustomers.length} customers
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;
