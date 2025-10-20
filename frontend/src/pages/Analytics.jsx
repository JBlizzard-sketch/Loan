import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign } from 'lucide-react'

export default function Analytics({ API_URL }) {
  const [summary, setSummary] = useState(null)
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [summaryRes, branchesRes] = await Promise.all([
        fetch(`${API_URL}/api/summary`),
        fetch(`${API_URL}/api/branches`)
      ])
      setSummary(await summaryRes.json())
      setBranches(await branchesRes.json())
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h4 className="font-bold text-blue-900 mb-3">Performance Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Avg Collection Rate:</span>
              <span className="font-bold text-blue-600">
                {(branches.reduce((sum, b) => sum + b.collection_rate, 0) / (branches.length || 1)).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Top Performer:</span>
              <span className="font-bold text-green-600">
                {branches.sort((a, b) => b.collection_rate - a.collection_rate)[0]?.branch || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total Branches:</span>
              <span className="font-bold text-gray-900">{branches.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h4 className="font-bold text-green-900 mb-3">Collection Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Collected:</span>
              <span className="font-bold text-green-600">{formatCurrency(summary?.total_collections || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Collection Efficiency:</span>
              <span className="font-bold text-green-600">{summary?.overall_collection_rate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Target:</span>
              <span className="font-bold text-gray-900">90%+</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-200">
          <h4 className="font-bold text-red-900 mb-3">Risk Indicators</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Arrears:</span>
              <span className="font-bold text-red-600">{formatCurrency(summary?.total_arrears || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">At-Risk Branches:</span>
              <span className="font-bold text-red-600">
                {branches.filter(b => b.collection_rate < 80).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Arrears Rate:</span>
              <span className="font-bold text-red-600">
                {((summary?.total_arrears / summary?.total_disbursements * 100) || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
