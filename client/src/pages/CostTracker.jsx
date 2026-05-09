import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import costService from '../services/cost.service'

const CostTracker = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'senior_management'
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedMonth, setSelectedMonth] = useState('Jun')
  const [selectedYear, setSelectedYear] = useState(2024)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    travel: '',
    license: '',
    freelancer: '',
    fte: '',
    partTimeIndia: '',
    partTimeUS: '',
  })

  // Fetch costs on mount
  useEffect(() => {
    const fetchCosts = async () => {
      try {
        setLoading(true)
        const response = await costService.getCosts()
        setCosts(response.data || response.costs || [])
        setError('')
      } catch (err) {
        console.error('Error fetching costs:', err)
        setError('Failed to fetch costs')
        setCosts([])
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) fetchCosts()
  }, [isAdmin])

  // Get current month data
  const currentMonthData = useMemo(() => {
    return costs.find((item) => item.month === selectedMonth && item.year === selectedYear)
  }, [costs, selectedMonth, selectedYear])

  // Cost breakdown
  const costBreakdown = useMemo(() => {
    if (!currentMonthData) {
      return {
        travel: 0,
        license: 0,
        freelancer: 0,
        fte: 0,
        partTimeIndia: 0,
        partTimeUS: 0,
        total: 0,
      }
    }

    const travel = parseFloat(currentMonthData.travel) || 0
    const license = parseFloat(currentMonthData.license) || 0
    const freelancer = parseFloat(currentMonthData.freelancer) || 0
    const fte = parseFloat(currentMonthData.fte) || 0
    const partTimeIndia = parseFloat(currentMonthData.partTimeIndia) || 0
    const partTimeUS = parseFloat(currentMonthData.partTimeUS) || 0
    const total = travel + license + freelancer + fte + partTimeIndia + partTimeUS

    return {
      travel,
      license,
      freelancer,
      fte,
      partTimeIndia,
      partTimeUS,
      total,
    }
  }, [currentMonthData])

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Travel', value: costBreakdown.travel },
      { name: 'License', value: costBreakdown.license },
      { name: 'Freelancer', value: costBreakdown.freelancer },
      { name: 'FTE Salary', value: costBreakdown.fte },
      { name: 'Part-Time India', value: costBreakdown.partTimeIndia },
      { name: 'Part-Time US', value: costBreakdown.partTimeUS },
    ].filter((item) => item.value > 0)
  }, [costBreakdown])

  // Bar chart data - monthly comparison
  const monthlyComparisonData = useMemo(() => {
    return costs
      .filter((item) => item.year === selectedYear)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return months.indexOf(a.month) - months.indexOf(b.month)
      })
      .map((item) => ({
        month: item.month,
        travel: parseFloat(item.travel) || 0,
        license: parseFloat(item.license) || 0,
        freelancer: parseFloat(item.freelancer) || 0,
        fte: parseFloat(item.fte) || 0,
        partTimeIndia: parseFloat(item.partTimeIndia) || 0,
        partTimeUS: parseFloat(item.partTimeUS) || 0,
      }))
  }, [costs, selectedYear])

  const COLORS = ['#0052CC', '#FF6B6B', '#FFB23F', '#17B890', '#8E44AD', '#E74C3C']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const costData = {
        company_id: 1,
        month: selectedMonth,
        year: selectedYear,
        ...formData,
      }

      if (editingId) {
        await costService.updateCost(editingId, costData)
        setCosts(costs.map(c => c.id === editingId ? { ...c, ...costData } : c))
        setSuccessMessage('Cost updated successfully!')
      } else {
        const response = await costService.createCost(costData)
        setCosts([...costs, response.data || { id: response.id, ...costData }])
        setSuccessMessage('Cost added successfully!')
      }

      setTimeout(() => setSuccessMessage(''), 3000)
      setFormData({
        travel: '',
        license: '',
        freelancer: '',
        fte: '',
        partTimeIndia: '',
        partTimeUS: '',
      })
      setEditingId(null)
      setShowAddForm(false)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save cost'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleEdit = (cost) => {
    setEditingId(cost.id)
    setFormData({
      travel: cost.travel || '',
      license: cost.license || '',
      freelancer: cost.freelancer || '',
      fte: cost.fte || '',
      partTimeIndia: cost.partTimeIndia || '',
      partTimeUS: cost.partTimeUS || '',
    })
    setSelectedMonth(cost.month)
    setSelectedYear(cost.year)
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cost record?')) return

    try {
      await costService.deleteCost(id)
      setCosts(costs.filter(c => c.id !== id))
      setSuccessMessage('Cost deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete cost'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      travel: '',
      license: '',
      freelancer: '',
      fte: '',
      partTimeIndia: '',
      partTimeUS: '',
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <div className="card p-8 text-center bg-red-50 border border-red-200">
          <p className="text-red-900 font-semibold text-lg">Access Denied</p>
          <p className="text-red-700 mt-2">Only Admin can view cost tracking details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Cost Tracker</h1>
        <p className="text-muted">Detailed breakdown of monthly expenses by category</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="card p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">✓ {successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="card p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">✗ {errorMessage}</p>
        </div>
      )}

      {/* Month/Year Selector */}
      <div className="card p-4 bg-gradient-to-r from-blue-50 to-orange-50 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add/Update Costs'}
        </button>
      </div>

      {/* Add Cost Form */}
      {showAddForm && (
        <div className="card p-6 bg-orange-50 border-2 border-orange-200">
          <h2 className="text-xl font-bold text-dark mb-4">
            {editingId ? 'Edit' : 'Enter'} {selectedMonth} {selectedYear} Cost Breakdown
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Travel Cost ($)</label>
              <input
                type="number"
                name="travel"
                placeholder="e.g. 3200"
                value={formData.travel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">License Cost ($)</label>
              <input
                type="number"
                name="license"
                placeholder="e.g. 1500"
                value={formData.license}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Freelancer Cost ($)</label>
              <input
                type="number"
                name="freelancer"
                placeholder="e.g. 7500"
                value={formData.freelancer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">FTE Salary ($)</label>
              <input
                type="number"
                name="fte"
                placeholder="e.g. 10000"
                value={formData.fte}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Part-Time India ($)</label>
              <input
                type="number"
                name="partTimeIndia"
                placeholder="e.g. 3500"
                value={formData.partTimeIndia}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Part-Time US ($)</label>
              <input
                type="number"
                name="partTimeUS"
                placeholder="e.g. 2300"
                value={formData.partTimeUS}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-end gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update Cost' : 'Save Cost Data'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cost Summary Cards */}
      {currentMonthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6 bg-blue-50 border-l-4 border-l-blue-500">
            <p className="text-muted text-sm mb-1">Travel</p>
            <p className="text-2xl font-bold text-blue-600">${(costBreakdown.travel / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted mt-2">{((costBreakdown.travel / costBreakdown.total) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="card p-6 bg-red-50 border-l-4 border-l-red-500">
            <p className="text-muted text-sm mb-1">License</p>
            <p className="text-2xl font-bold text-red-600">${(costBreakdown.license / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted mt-2">{((costBreakdown.license / costBreakdown.total) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="card p-6 bg-orange-50 border-l-4 border-l-orange-500">
            <p className="text-muted text-sm mb-1">Freelancer</p>
            <p className="text-2xl font-bold text-orange-600">${(costBreakdown.freelancer / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted mt-2">{((costBreakdown.freelancer / costBreakdown.total) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="card p-6 bg-green-50 border-l-4 border-l-green-500">
            <p className="text-muted text-sm mb-1">FTE Salary</p>
            <p className="text-2xl font-bold text-green-600">${(costBreakdown.fte / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted mt-2">{((costBreakdown.fte / costBreakdown.total) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="card p-6 bg-purple-50 border-l-4 border-l-purple-500">
            <p className="text-muted text-sm mb-1">Part-Time India</p>
            <p className="text-2xl font-bold text-purple-600">${(costBreakdown.partTimeIndia / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted mt-2">{((costBreakdown.partTimeIndia / costBreakdown.total) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="card p-6 bg-pink-50 border-l-4 border-l-pink-500">
            <p className="text-muted text-sm mb-1">Part-Time US</p>
            <p className="text-2xl font-bold text-pink-600">${(costBreakdown.partTimeUS / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted mt-2">{((costBreakdown.partTimeUS / costBreakdown.total) * 100).toFixed(1)}% of total</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {currentMonthData && costBreakdown.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="card p-6">
            <h2 className="card-title mb-6">Cost Distribution - {selectedMonth} {selectedYear}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={true} label={({ name, value }) => `${name}: $${(value / 1000).toFixed(1)}K`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Total Cost Card */}
          <div className="card p-6 flex flex-col justify-center">
            <div className="text-center">
              <p className="text-muted text-sm mb-2">Total Monthly Cost</p>
              <p className="text-5xl font-bold text-dark mb-4">${(costBreakdown.total / 1000).toFixed(1)}K</p>
              <div className="pt-6 border-t border-border">
                <p className="text-muted text-sm mb-4">Cost By Category</p>
                <div className="space-y-2">
                  {pieData.map((item, idx) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                        <span className="text-sm text-dark">{item.name}</span>
                      </span>
                      <span className="font-semibold text-dark">${(item.value / 1000).toFixed(1)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Comparison Chart */}
      {monthlyComparisonData.length > 0 && (
        <div className="card p-6">
          <h2 className="card-title mb-6">Cost Trend Analysis - {selectedYear}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
              <Legend />
              <Bar dataKey="travel" fill="#0052CC" name="Travel" />
              <Bar dataKey="license" fill="#FF6B6B" name="License" />
              <Bar dataKey="freelancer" fill="#FFB23F" name="Freelancer" />
              <Bar dataKey="fte" fill="#17B890" name="FTE Salary" />
              <Bar dataKey="partTimeIndia" fill="#8E44AD" name="PT India" />
              <Bar dataKey="partTimeUS" fill="#E74C3C" name="PT US" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!currentMonthData && (
        <div className="card p-12 text-center bg-gray-50">
          <p className="text-xl text-muted mb-2">No cost data available</p>
          <p className="text-sm text-muted">Add cost data using the form above to see cost analysis</p>
        </div>
      )}

      {/* All Cost Records */}
      {costs.length > 0 && (
        <div className="card p-6">
          <h2 className="card-title mb-6">All Cost Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-dark">Month/Year</th>
                  <th className="px-4 py-2 text-right font-semibold text-dark">Total ($)</th>
                  <th className="px-4 py-2 text-center font-semibold text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((cost) => {
                  const total = (parseFloat(cost.travel) || 0) + (parseFloat(cost.license) || 0) + (parseFloat(cost.freelancer) || 0) + (parseFloat(cost.fte) || 0) + (parseFloat(cost.partTimeIndia) || 0) + (parseFloat(cost.partTimeUS) || 0)
                  return (
                    <tr key={cost.id} className="border-b border-border hover:bg-light">
                      <td className="px-4 py-3">{cost.month} {cost.year}</td>
                      <td className="px-4 py-3 text-right font-semibold">${total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEdit(cost)}
                          className="text-primary text-xs hover:underline font-medium mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cost.id)}
                          className="text-red-600 text-xs hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CostTracker
