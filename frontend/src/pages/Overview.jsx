import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle, Users, Building2, DollarSign, CheckCircle2 } from 'lucide-react'

export default function Overview({ API_URL }) {
  const [summary, setSummary] = useState(null)
  const [branches, setBranches] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [summaryRes, branchesRes, insightsRes] = await Promise.all([
        fetch(`${API_URL}/api/summary`),
        fetch(`${API_URL}/api/branches`),
        fetch(`${API_URL}/api/ai/insights`)
      ])
      setSummary(await summaryRes.json())
      setBranches(await branchesRes.json())
      setInsights((await insightsRes.json()).insights)
    } catch (err) {
      console.error('Error:', err)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
          <DollarSign size={40} className="opacity-90 mb-4" />
          <div className="text-sm text-blue-100 mb-2 font-medium uppercase">Total Disbursements</div>
          <div className="text-3xl font-extrabold">{formatCurrency(summary?.total_disbursements || 0)}</div>
          <div className="mt-3 text-xs text-blue-100">Across {summary?.branch_count || 0} branches</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
          <CheckCircle2 size={40} className="opacity-90 mb-4" />
          <div className="text-sm text-green-100 mb-2 font-medium uppercase">Total Collections</div>
          <div className="text-3xl font-extrabold">{formatCurrency(summary?.total_collections || 0)}</div>
          <div className="mt-3 text-xs text-green-100">
            {((summary?.total_collections / summary?.total_disbursements * 100) || 0).toFixed(1)}% of disbursements
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
          <AlertTriangle size={40} className="opacity-90 mb-4" />
          <div className="text-sm text-red-100 mb-2 font-medium uppercase">Total Arrears</div>
          <div className="text-3xl font-extrabold">{formatCurrency(summary?.total_arrears || 0)}</div>
          <div className="mt-3 text-xs text-red-100">Requires attention</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
          <TrendingUp size={40} className="opacity-90 mb-4" />
          <div className="text-sm text-purple-100 mb-2 font-medium uppercase">Collection Rate</div>
          <div className="text-3xl font-extrabold">{summary?.overall_collection_rate || 0}%</div>
          <div className="mt-3">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{width: `${summary?.overall_collection_rate || 0}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Building2 size={28} className="text-blue-600" />
            Quick Branch Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branches.slice(0, 6)}>
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

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            AI Insights
          </h2>
          <ul className="space-y-3">
            {insights.slice(0, 5).map((insight, index) => (
              <li key={index} className="flex items-start group hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 p-3 rounded-lg transition-all">
                <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-lg">
                  {index + 1}
                </span>
                <span className="text-gray-700 font-medium text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white">
          <Users size={48} className="mb-3 opacity-90" />
          <div className="text-sm text-blue-100 mb-2 font-medium uppercase">Total Customers</div>
          <div className="text-4xl font-extrabold">{summary?.total_customers?.toLocaleString() || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-2xl p-6 text-white">
          <TrendingUp size={48} className="mb-3 opacity-90" />
          <div className="text-sm text-amber-100 mb-2 font-medium uppercase">Avg Per Branch</div>
          <div className="text-4xl font-extrabold">
            {formatCurrency((summary?.total_disbursements || 0) / (summary?.branch_count || 1))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl shadow-2xl p-6 text-white">
          <Building2 size={48} className="mb-3 opacity-90" />
          <div className="text-sm text-teal-100 mb-2 font-medium uppercase">Active Branches</div>
          <div className="text-4xl font-extrabold">{summary?.branch_count || 0}</div>
        </div>
      </div>
    </div>
  )
}
