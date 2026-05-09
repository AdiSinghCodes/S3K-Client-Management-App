import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import companyService from '../services/company.service'
import costService from '../services/cost.service'
import productivityService from '../services/productivity.service'
import KPICard from '../components/ui/KPICard'
import ProgressBar from '../components/ui/ProgressBar'

const Dashboard = () => {
  const { user } = useAuth()
  const isFounder = user?.role === 'senior_management' || user?.role === 'admin'
  const [companies, setCompanies] = useState([])
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Initialize with current month and year
  const currentDate = new Date()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = monthNames[currentDate.getMonth()]
  const currentYear = currentDate.getFullYear()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    revenue: '',
    travel: '',
    license: '',
    freelancer: '',
    fte: '',
    partTimeIndia: '',
    partTimeUS: '',
  })
  const [teamFormData, setTeamFormData] = useState({
    tasksCompleted: '',
    tasksTarget: '',
    reportsSubmitted: '',
    reportsTarget: '',
    projectProgress: '',
    notes: '',
  })

  // Note: parseMonthYear is no longer needed - backend provides month and year directly

  // Refetch costs from API
  const refetchCosts = async () => {
    try {
      console.log('🔄 Fetching costs...')
      const costsRes = await costService.getCosts()
      console.log('Costs response:', costsRes)
      const costsData = costsRes.data || costsRes.costs || []
      console.log('Costs data:', costsData)
      // Backend already provides month and year, use them directly
      console.log('Costs from backend:', costsData)
      setCosts(costsData)
    } catch (err) {
      console.error('Error refetching costs:', err)
    }
  }

  // Fetch companies and costs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('📊 Fetching dashboard data for Senior Management:', isFounder)
        const [companiesRes, costsRes] = await Promise.all([
          companyService.getCompanies(),
          isFounder ? costService.getCosts() : Promise.resolve({ data: [] }),
        ])
        console.log('Companies response:', companiesRes)
        console.log('Costs response:', costsRes)
        setCompanies(companiesRes.data || companiesRes.companies || [])
        
        // Use costs data from backend - month and year are already extracted
        const costsData = costsRes.data || costsRes.costs || []
        console.log('Costs data extracted:', costsData)
        setCosts(costsData)
        setError('')
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isFounder])

  // Helper to get previous month
  const getPreviousMonth = (month, year) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthIndex = months.indexOf(month)
    if (monthIndex === 0) {
      return { month: 'Dec', year: year - 1 }
    }
    return { month: months[monthIndex - 1], year }
  }

  // Calculate trend percentage
  const calculateTrend = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return null
    const change = ((currentValue - previousValue) / previousValue) * 100
    return parseFloat(change.toFixed(1))
  }

  // Get current month data
  const currentMonthData = useMemo(() => {
    return costs.find((item) => item.month === selectedMonth && item.year === selectedYear)
  }, [costs, selectedMonth, selectedYear])

  // Get previous month data
  const previousMonthData = useMemo(() => {
    const { month: prevMonth, year: prevYear } = getPreviousMonth(selectedMonth, selectedYear)
    return costs.find((item) => item.month === prevMonth && item.year === prevYear)
  }, [costs, selectedMonth, selectedYear])

  // Calculate totals and trends
  const calculatedData = useMemo(() => {
    if (!currentMonthData) {
      return {
        revenue: 0,
        totalCost: 0,
        gm: 0,
        gmPercent: 0,
        revenueTrend: null,
        costTrend: null,
        gmTrend: null,
        gmPercentTrend: null,
      }
    }

    // Use pre-calculated values from database
    const revenue = parseFloat(currentMonthData.revenue) || 0
    const totalCost = parseFloat(currentMonthData.total_cost) || 0
    const gm = parseFloat(currentMonthData.gross_margin) || 0
    const gmPercent = parseFloat(currentMonthData.gm_percentage) || 0

    // Calculate trends only if previous month data exists
    let revenueTrend = null
    let costTrend = null
    let gmTrend = null
    let gmPercentTrend = null

    if (previousMonthData) {
      const prevRevenue = parseFloat(previousMonthData.revenue) || 0
      const prevTotalCost = parseFloat(previousMonthData.total_cost) || 0
      const prevGm = parseFloat(previousMonthData.gross_margin) || 0
      const prevGmPercent = parseFloat(previousMonthData.gm_percentage) || 0

      revenueTrend = calculateTrend(revenue, prevRevenue)
      costTrend = calculateTrend(totalCost, prevTotalCost)
      gmTrend = calculateTrend(gm, prevGm)
      gmPercentTrend = calculateTrend(gmPercent, prevGmPercent)
    }

    return { revenue, totalCost, gm, gmPercent, revenueTrend, costTrend, gmTrend, gmPercentTrend }
  }, [currentMonthData, previousMonthData])

  // Generate chart data
  const chartData = useMemo(() => {
    return costs
      .filter((item) => item.year === selectedYear)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return months.indexOf(a.month) - months.indexOf(b.month)
      })
      .map((item) => {
        const revenue = parseFloat(item.revenue) || 0
        const totalCost = parseFloat(item.total_cost) || 0
        const gm = parseFloat(item.gross_margin) || 0
        const gmPercent = parseFloat(item.gm_percentage) || 0

        return {
          month: item.month,
          revenue,
          cost: totalCost,
          gm,
          gmPercent: parseFloat(gmPercent),
        }
      })
  }, [costs, selectedYear])

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
    const totalCost = chartData.reduce((sum, item) => sum + item.cost, 0)
    const totalGM = totalRevenue - totalCost
    const avgGMPercent = totalRevenue > 0 ? ((totalGM / totalRevenue) * 100).toFixed(1) : 0

    return { totalRevenue, totalCost, totalGM, avgGMPercent }
  }, [chartData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.revenue && companies.length > 0) {
      try {
        // Check if data already exists for this month
        const existingRecord = costs.find((item) => item.month === selectedMonth && item.year === selectedYear)
        
        if (existingRecord) {
          // UPDATE existing record - Send only the cost fields
          const updateData = {
            revenue: parseFloat(formData.revenue) || 0,
            travel: parseFloat(formData.travel) || 0,
            license: parseFloat(formData.license) || 0,
            freelancer: parseFloat(formData.freelancer) || 0,
            fte: parseFloat(formData.fte) || 0,
            partTimeIndia: parseFloat(formData.partTimeIndia) || 0,
            partTimeUS: parseFloat(formData.partTimeUS) || 0,
          }
          await costService.updateCost(existingRecord.id, updateData)
          setSuccessMessage('✓ Financial data updated successfully!')
        } else {
          // CREATE new record - Send full data with month, year, company_id
          const costData = {
            company_id: companies[0]?.id || 1,
            month: selectedMonth,
            year: selectedYear,
            revenue: parseFloat(formData.revenue) || 0,
            travel: parseFloat(formData.travel) || 0,
            license: parseFloat(formData.license) || 0,
            freelancer: parseFloat(formData.freelancer) || 0,
            fte: parseFloat(formData.fte) || 0,
            partTimeIndia: parseFloat(formData.partTimeIndia) || 0,
            partTimeUS: parseFloat(formData.partTimeUS) || 0,
          }
          await costService.createCost(costData)
          setSuccessMessage('✓ Financial data saved successfully!')
        }
        
        // Refetch data from API to ensure we have all calculated fields
        await refetchCosts()
        
        setTimeout(() => setSuccessMessage(''), 3000)
        setFormData({
          revenue: '',
          travel: '',
          license: '',
          freelancer: '',
          fte: '',
          partTimeIndia: '',
          partTimeUS: '',
        })
        setShowAddForm(false)
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to save financial data'
        setErrorMessage(errorMsg)
        setTimeout(() => setErrorMessage(''), 3000)
        console.error('Error adding cost:', err)
      }
    }
  }

  const handleTeamInputChange = (e) => {
    const { name, value } = e.target
    setTeamFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTeamSubmit = async (e) => {
    e.preventDefault()
    if (teamFormData.tasksCompleted || teamFormData.reportsSubmitted) {
      try {
        const logData = {
          tasksCompleted: parseInt(teamFormData.tasksCompleted) || 0,
          tasksTarget: parseInt(teamFormData.tasksTarget) || 0,
          reportsSubmitted: parseInt(teamFormData.reportsSubmitted) || 0,
          reportsTarget: parseInt(teamFormData.reportsTarget) || 0,
          projectProgress: parseInt(teamFormData.projectProgress) || 0,
          notes: teamFormData.notes,
        }
        await productivityService.createProductivityLog(logData)
        setSuccessMessage('✓ Team productivity data saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
        setTeamFormData({
          tasksCompleted: '',
          tasksTarget: '',
          reportsSubmitted: '',
          reportsTarget: '',
          projectProgress: '',
          notes: '',
        })
        setShowTeamForm(false)
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to save productivity data'
        setErrorMessage(errorMsg)
        setTimeout(() => setErrorMessage(''), 3000)
        console.error('Error saving productivity:', err)
      }
    }
  }

  // SENIOR MANAGEMENT DASHBOARD
  if (isFounder) {
    return (
      <div className="space-y-6 pt-12 px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-3">Welcome back, Senior Management!</h1>
          <p className="text-lg text-muted">Here's how your company is doing</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="card p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-green-600 font-medium">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="card p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">✗ {errorMessage}</p>
          </div>
        )}

        {/* Month/Year Selector */}
        <div className="card p-4 bg-gradient-to-r from-blue-50 to-purple-50 flex flex-wrap gap-4 items-end">
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
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
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
            {showAddForm ? 'Cancel' : '+ Add/Update Data'}
          </button>
        </div>

        {/* Add Data Form */}
        {showAddForm && (
          <div className="card p-6 bg-green-50 border-2 border-green-200">
            <h2 className="text-xl font-bold text-dark mb-4">Enter {selectedMonth} {selectedYear} Financial Data</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Revenue ($)</label>
                <input
                  type="number"
                  name="revenue"
                  placeholder="e.g. 68000"
                  value={formData.revenue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

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

              <div className="flex items-end">
                <button type="submit" className="w-full btn-primary">
                  Save Data
                </button>
              </div>
            </form>
          </div>
        )}

        {/* KPI Cards - Real-time calculations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard icon="" label="Total Revenue" value={`$${(calculatedData.revenue / 1000).toFixed(0)}K`} trend={calculatedData.revenueTrend} />
          <KPICard icon="" label="Total Cost" value={`$${(calculatedData.totalCost / 1000).toFixed(0)}K`} trend={calculatedData.costTrend} />
          <KPICard icon="" label="Gross Margin" value={`$${(calculatedData.gm / 1000).toFixed(0)}K`} trend={calculatedData.gmTrend} />
          <KPICard icon="" label="GM %" value={`${calculatedData.gmPercent}%`} trend={calculatedData.gmPercentTrend} />
        </div>

        {/* Charts Section */}
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Cost Chart */}
            <div className="card p-6">
              <h2 className="card-title mb-6">Revenue & Cost Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0052CC" name="Revenue" />
                  <Bar dataKey="cost" fill="#FF6B6B" name="Cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gross Margin % Chart */}
            <div className="card p-6">
              <h2 className="card-title mb-6">Gross Margin Trend (%)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="gmPercent" stroke="#17B890" strokeWidth={2} dot={{ fill: '#17B890' }} name="GM %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center bg-gray-50">
            <p className="text-xl text-muted mb-2">No data available</p>
            <p className="text-sm text-muted">Add financial data using the form above to see charts</p>
          </div>
        )}
      </div>
    )
  }

  // TEAM MEMBER DASHBOARD - NO FINANCIAL DATA
  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted">Here's your assigned work overview</p>
      </div>

      {/* Assigned Work Summary - NO FINANCIAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon="" label="Assigned Companies" value={companies.length.toString()} />
        <KPICard icon="" label="Role" value={user?.role === 'senior_management' ? 'Senior Management' : 'Team Member'} />
        <KPICard icon="" label="Status" value="Active" />
        <KPICard icon="" label="Access Level" value={user?.role === 'senior_management' ? 'Full' : 'Limited'} />
      </div>

      {/* Alert: No Financial Access for Team Members */}
      <div className="card p-6 bg-yellow-50 border border-yellow-200">
        <p className="text-yellow-900 font-medium">⚠️ Note: Financial data (revenue, costs, margins) is only visible to Senior Management/Admins. You see only your assigned clients and work.</p>
      </div>

      {/* My Assigned Companies - Read Only */}
      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-lg text-muted">Loading your companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="card p-8 text-center bg-gray-50">
          <p className="text-lg text-muted">No companies assigned yet</p>
          <p className="text-sm text-muted mt-2">Contact your manager to get assigned clients</p>
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="card-title mb-6">Your Assigned Companies</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-dark">Company Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Industry</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Status</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-border hover:bg-light transition-colors">
                    <td className="py-4 px-4 text-dark font-medium">{company.company_name || company.name}</td>
                    <td className="py-4 px-4 text-dark">{company.industry || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`badge ${company.status === 'Active' || company.status === 'active' ? 'badge-success' : 'badge-info'}`}>
                        {company.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">What you can do:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>View your assigned companies and clients</li>
          <li>Submit weekly reports with progress updates</li>
          <li>Log AI use cases and training sessions</li>
          <li>Track your tasks and projects</li>
          <li>Submit executive meeting reviews</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
