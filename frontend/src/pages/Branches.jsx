import { useState, useEffect } from 'react'
import { Search, Users, Download } from 'lucide-react'

export default function Branches({ API_URL }) {
  const [branches, setBranches] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRate, setFilterRate] = useState('all')
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_URL}/api/branches`)
      setBranches(await response.json())
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
    link.download = `kechita-branches-${new Date().toISOString().split('T')[0]}.csv`
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRate('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterRate === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterRate('high')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterRate === 'high' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            High ≥90%
          </button>
          <button
            onClick={() => setFilterRate('medium')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterRate === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Medium 80-90%
          </button>
          <button
            onClick={() => setFilterRate('low')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterRate === 'low' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Low &lt;80%
          </button>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Branch</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Disbursements</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Collections</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Arrears</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Rate</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Customers</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredBranches.map((branch, index) => (
                <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {branch.branch[0]}
                      </div>
                      <div className="ml-4 font-bold text-gray-900">{branch.branch}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{formatCurrency(branch.total_disbursements)}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(branch.total_collections)}</td>
                  <td className="px-6 py-4 font-semibold text-red-600">{formatCurrency(branch.total_arrears)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                      branch.collection_rate >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                      branch.collection_rate >= 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                      'bg-gradient-to-r from-red-400 to-rose-500 text-white'
                    }`}>
                      {branch.collection_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-gray-500" />
                      <span className="font-semibold text-gray-700">{branch.customer_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedBranch(branch)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
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
              <button onClick={() => setSelectedBranch(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
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

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-semibold">Total Customers</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{selectedBranch.customer_count}</div>
                </div>
                <Users size={40} className="text-gray-400" />
              </div>
            </div>

            <button
              onClick={() => setSelectedBranch(null)}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
