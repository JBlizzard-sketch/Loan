import { useState, useEffect } from 'react'
import {  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Search, TrendingUp, AlertTriangle, Users, Building2, DollarSign, CheckCircle2, Send, Filter } from 'lucide-react'
import './App.css'

function App() {
  const [summary, setSummary] = useState(null)
  const [branches, setBranches] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRate, setFilterRate] = useState('all')
  const [selectedBranch, setSelectedBranch] = useState(null)

  const API_URL = ''

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [summaryRes, branchesRes, insightsRes] = await Promise.all([
        fetch(`${API_URL}/api/summary`),
        fetch(`${API_URL}/api/branches`),
        fetch(`${API_URL}/api/ai/insights`)
      ])

      if (!summaryRes.ok || !branchesRes.ok || !insightsRes.ok) {
        throw new Error('Failed to fetch data from API')
      }

      const summaryData = await summaryRes.json()
      const branchesData = await branchesRes.json()
      const insightsData = await insightsRes.json()

      setSummary(summaryData)
      setBranches(branchesData)
      setInsights(insightsData.insights)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(value)
  }

  const exportToCSV = () => {
    const headers = ['Branch', 'Disbursements', 'Collections', 'Arrears', 'Collection Rate (%)', 'Customers']
    const rows = filteredBranches.map(b => [
      b.branch,
      b.total_disbursements,
      b.total_collections,
      b.total_arrears,
      b.collection_rate,
      b.customer_count
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kechita-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.branch.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = 
      filterRate === 'all' ? true :
      filterRate === 'high' ? branch.collection_rate >= 90 :
      filterRate === 'medium' ? branch.collection_rate >= 80 && branch.collection_rate < 90 :
      branch.collection_rate < 80
    return matchesSearch && matchesFilter
  })

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching real-time analytics</p>
        </div>
      </div>
    )
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-red-800 font-bold text-xl mb-2 text-center">Connection Error</h2>
          <p className="text-red-600 mb-6 text-center">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 font-semibold shadow-lg"
          >
            🔄 Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                <span className="text-4xl md:text-5xl">🏦</span>
                Kechita Intelligence Platform
              </h1>
              <p className="text-blue-100 mt-2 text-sm md:text-lg font-medium">Real-time operational analytics for microfinance excellence</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportToCSV}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all font-semibold backdrop-blur-sm border border-white/30 flex items-center gap-2"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button 
                onClick={fetchData}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all font-semibold backdrop-blur-sm border border-white/30"
              >
                🔄 <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'branches', label: 'Branches', icon: '🏢' },
              { id: 'messaging', label: 'Messaging', icon: '💬' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign size={40} className="opacity-90" />
                  <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Total</div>
                </div>
                <div className="text-sm text-blue-100 mb-2 font-medium uppercase tracking-wide">Total Disbursements</div>
                <div className="text-3xl font-extrabold">{formatCurrency(summary?.total_disbursements || 0)}</div>
                <div className="mt-3 text-xs text-blue-100">Across {summary?.branch_count || 0} branches</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 size={40} className="opacity-90" />
                  <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Collected</div>
                </div>
                <div className="text-sm text-green-100 mb-2 font-medium uppercase tracking-wide">Total Collections</div>
                <div className="text-3xl font-extrabold">{formatCurrency(summary?.total_collections || 0)}</div>
                <div className="mt-3 text-xs text-green-100">
                  {((summary?.total_collections / summary?.total_disbursements * 100) || 0).toFixed(1)}% of disbursements
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle size={40} className="opacity-90" />
                  <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Outstanding</div>
                </div>
                <div className="text-sm text-red-100 mb-2 font-medium uppercase tracking-wide">Total Arrears</div>
                <div className="text-3xl font-extrabold">{formatCurrency(summary?.total_arrears || 0)}</div>
                <div className="mt-3 text-xs text-red-100">Requires attention</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp size={40} className="opacity-90" />
                  <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Performance</div>
                </div>
                <div className="text-sm text-purple-100 mb-2 font-medium uppercase tracking-wide">Collection Rate</div>
                <div className="text-3xl font-extrabold">{summary?.overall_collection_rate || 0}%</div>
                <div className="mt-3">
                  <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <div className="bg-white h-full rounded-full transition-all" style={{width: `${summary?.overall_collection_rate || 0}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Building2 size={28} />
                    Quick Branch Overview
                  </h2>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branches.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="total_collections" fill="#10B981" name="Collections" />
                      <Bar dataKey="total_arrears" fill="#EF4444" name="Arrears" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">🤖</span>
                    AI Insights
                  </h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {insights.map((insight, index) => (
                      <li key={index} className="flex items-start group hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 p-3 rounded-lg transition-all">
                        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 font-medium text-sm leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white">
                <Users size={48} className="mb-3 opacity-90" />
                <div className="text-sm text-blue-100 mb-2 font-medium uppercase tracking-wide">Total Customers</div>
                <div className="text-4xl font-extrabold">{summary?.total_customers?.toLocaleString() || 0}</div>
                <div className="mt-4 text-xs text-blue-100">Active accounts across all branches</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-2xl p-6 text-white">
                <TrendingUp size={48} className="mb-3 opacity-90" />
                <div className="text-sm text-amber-100 mb-2 font-medium uppercase tracking-wide">Average Per Branch</div>
                <div className="text-4xl font-extrabold">
                  {formatCurrency((summary?.total_disbursements || 0) / (summary?.branch_count || 1))}
                </div>
                <div className="mt-4 text-xs text-amber-100">Average disbursements per location</div>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl shadow-2xl p-6 text-white">
                <Building2 size={48} className="mb-3 opacity-90" />
                <div className="text-sm text-teal-100 mb-2 font-medium uppercase tracking-wide">Active Branches</div>
                <div className="text-4xl font-extrabold">{summary?.branch_count || 0}</div>
                <div className="mt-4 text-xs text-teal-100">Microfinance locations nationwide</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Collection Rate by Branch
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={branches}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branch" angle={-45} textAnchor="end" height={120} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="collection_rate" stroke="#10B981" strokeWidth={3} name="Collection Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Branch Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={branches}
                      dataKey="total_disbursements"
                      nameKey="branch"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.branch}: ${((entry.total_disbursements / summary.total_disbursements) * 100).toFixed(1)}%`}
                    >
                      {branches.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-green-600" />
                Disbursements vs Collections Comparison
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={branches}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total_disbursements" fill="#3B82F6" name="Disbursements" />
                  <Bar dataKey="total_collections" fill="#10B981" name="Collections" />
                  <Bar dataKey="total_arrears" fill="#EF4444" name="Arrears" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'branches' && (
          <>
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRate('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterRate === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRate('high')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterRate === 'high' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  High ≥90%
                </button>
                <button
                  onClick={() => setFilterRate('medium')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterRate === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Medium 80-90%
                </button>
                <button
                  onClick={() => setFilterRate('low')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterRate === 'low' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Low &lt;80%
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Disbursements</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Collections</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Arrears</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customers</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredBranches.map((branch, index) => (
                      <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                              {branch.branch[0]}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{branch.branch}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{formatCurrency(branch.total_disbursements)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(branch.total_collections)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{formatCurrency(branch.total_arrears)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                              branch.collection_rate >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                              branch.collection_rate >= 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                              'bg-gradient-to-r from-red-400 to-rose-500 text-white'
                            }`}>
                              {branch.collection_rate}%
                            </span>
                            {branch.collection_rate >= 90 && <span className="text-xl">🌟</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users size={20} className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">{branch.customer_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedBranch(branch)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedBranch && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBranch(null)}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{selectedBranch.branch}</h2>
                      <p className="text-gray-600 mt-1">Detailed Branch Analysis</p>
                    </div>
                    <button onClick={() => setSelectedBranch(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 font-semibold">Disbursements</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(selectedBranch.total_disbursements)}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 font-semibold">Collections</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(selectedBranch.total_collections)}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-red-600 font-semibold">Arrears</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(selectedBranch.total_arrears)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600 font-semibold">Collection Rate</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{selectedBranch.collection_rate}%</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 font-semibold">Total Customers</div>
                        <div className="text-xl font-bold text-gray-900 mt-1">{selectedBranch.customer_count}</div>
                      </div>
                      <Users size={40} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                      Send Report
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition" onClick={() => setSelectedBranch(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'messaging' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">💬</div>
                <div>
                  <h2 className="text-3xl font-bold">WhatsApp Messaging</h2>
                  <p className="text-green-100 mt-1">Automated branch communications</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Status</span>
                    <span className="bg-white/30 px-3 py-1 rounded-full text-sm">Ready to Configure</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm font-semibold mb-2">Available Features:</div>
                  <ul className="text-sm space-y-1 text-green-100">
                    <li>✓ Daily performance summaries</li>
                    <li>✓ Collection reminders</li>
                    <li>✓ Motivational messages</li>
                    <li>✓ Alert notifications</li>
                  </ul>
                </div>
              </div>

              <button className="w-full bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Send size={20} />
                Configure WhatsApp
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">📱</div>
                <div>
                  <h2 className="text-3xl font-bold">Telegram Bot</h2>
                  <p className="text-blue-100 mt-1">Real-time insights delivery</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Status</span>
                    <span className="bg-white/30 px-3 py-1 rounded-full text-sm">Ready to Configure</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm font-semibold mb-2">Available Features:</div>
                  <ul className="text-sm space-y-1 text-blue-100">
                    <li>✓ AI-powered insights</li>
                    <li>✓ Weekly reports</li>
                    <li>✓ Performance alerts</li>
                    <li>✓ Interactive commands</li>
                  </ul>
                </div>
              </div>

              <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Send size={20} />
                Configure Telegram
              </button>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Daily Summary', desc: 'Automated morning reports with key metrics', icon: '📊' },
                  { title: 'Arrears Alert', desc: 'Notifications for high-risk accounts', icon: '⚠️' },
                  { title: 'Motivation Message', desc: 'Encouraging messages for branch staff', icon: '💪' },
                  { title: 'Weekly Review', desc: 'Comprehensive weekly performance reports', icon: '📈' }
                ].map((template, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{template.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{template.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 mt-12 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-300 text-sm font-medium">
              🏦 Kechita Intelligence Platform v3.0 - Advanced AI Analytics
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Online</span>
              </div>
              <div className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
