import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import productivityService from '../services/productivity.service'
import KPICard from '../components/ui/KPICard'
import ProgressBar from '../components/ui/ProgressBar'

const TeamProductivity = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'senior_management'
  const [productivity, setProductivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedMonth, setSelectedMonth] = useState('Jun')
  const [selectedYear, setSelectedYear] = useState(2024)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage,  setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    tasksCompleted: '',
    tasksTarget: '',
    reportsSubmitted: '',
    reportsTarget: '',
    milestonesClosedCount: '',
    usecaseUpdatesCount: '',
  })

  // Fetch productivity data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch productivity logs
        const productivityResponse = await productivityService.getProductivityLogs()
        setProductivity(productivityResponse.data || productivityResponse.logs || [])
        
        setError('')
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data')
        setProductivity([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get month data for this team
  const getTeamMonthData = (month, year) => {
    return productivity.filter((item) => item.month === month && item.year === year)
  }

  const monthData = useMemo(() => {
    return getTeamMonthData(selectedMonth, selectedYear)
  }, [productivity, selectedMonth, selectedYear])

  // Calculate productivity score: (tasks% × 30%) + (reports% × 25%) + (milestones% × 25%) + (usecases% × 20%)
  const calculateScore = (member) => {
    const tasksPercent = member.tasksTarget > 0 ? (member.tasksCompleted / member.tasksTarget) * 100 : 0
    const reportsPercent = member.reportsTarget > 0 ? (member.reportsSubmitted / member.reportsTarget) * 100 : 0
    const milestonesPercent = Math.min(member.milestonesClosedCount * 10, 100)
    const usecasesPercent = Math.min(member.usecaseUpdatesCount * 10, 100)

    const score =
      (tasksPercent * 0.3 + reportsPercent * 0.25 + milestonesPercent * 0.25 + usecasesPercent * 0.2) / 100
    return (score * 10).toFixed(1)
  }

  // Summary data
  const summaryData = useMemo(() => {
    if (monthData.length === 0) {
      return {
        avgScore: 0,
        totalTasks: 0,
        totalReports: 0,
        avgTaskCompletion: 0,
      }
    }

    const avgScore = (monthData.reduce((sum, m) => sum + parseFloat(calculateScore(m)), 0) / monthData.length).toFixed(1)
    const totalTasks = monthData.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0)
    const totalReports = monthData.reduce((sum, m) => sum + (m.reportsSubmitted || 0), 0)
    const avgTaskCompletion =
      (monthData.reduce((sum, m) => sum + (m.tasksTarget > 0 ? (m.tasksCompleted / m.tasksTarget) * 100 : 0), 0) /
        monthData.length).toFixed(1)

    return {
      avgScore,
      totalTasks,
      totalReports,
      avgTaskCompletion,
    }
  }, [monthData])

  // Chart data for member scores
  const scoreChartData = useMemo(() => {
    return monthData.map((member) => ({
      name: member.memberName || `Team Member ${member.memberId}`,
      score: calculateScore(member),
    }))
  }, [monthData])

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
      // Convert month to month_year format (use first day of month)
      const monthMap = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
      const monthNum = monthMap[selectedMonth] || '01';
      const month_year = `${selectedYear}-${monthNum}-01`;

      const performanceData = {
        company_id: 1,
        user_id: parseInt(formData.memberId) || 1,  // Default to user 1 if not selected from dropdown
        member_name: formData.memberName,  // Send the typed name to backend
        month_year: month_year,
        tasks_completed: parseInt(formData.tasksCompleted) || 0,
        tasks_target: parseInt(formData.tasksTarget) || 0,
        reports_submitted: parseInt(formData.reportsSubmitted) || 0,
        reports_target: parseInt(formData.reportsTarget) || 0,
        milestones_achieved: parseInt(formData.milestonesClosedCount) || 0,
        use_cases_live: parseInt(formData.usecaseUpdatesCount) || 0,
      }

      console.log('Submitting performance data:', performanceData);

      if (editingId) {
        const updateResponse = await productivityService.updateProductivityLog(editingId, performanceData)
        const updatedLog = updateResponse.log || updateResponse.data?.log
        setProductivity(productivity.map(p => p.id === editingId ? updatedLog : p))
        setSuccessMessage('Performance data updated successfully!')
      } else {
        const createResponse = await productivityService.createProductivityLog(performanceData)
        const newLog = createResponse.log || createResponse.data?.log
        setProductivity([...productivity, newLog])
        setSuccessMessage('Performance data added successfully!')
      }

      setTimeout(() => setSuccessMessage(''), 3000)
      setFormData({
        memberId: '1',
        memberName: 'Team Member 1',
        tasksCompleted: '',
        tasksTarget: '',
        reportsSubmitted: '',
        reportsTarget: '',
        milestonesClosedCount: '',
        usecaseUpdatesCount: '',
      })
      setEditingId(null)
      setShowAddForm(false)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save performance data'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setFormData({
      memberId: record.memberId || '',
      memberName: record.memberName || '',
      tasksCompleted: record.tasksCompleted || '',
      tasksTarget: record.tasksTarget || '',
      reportsSubmitted: record.reportsSubmitted || '',
      reportsTarget: record.reportsTarget || '',
      milestonesClosedCount: record.milestonesClosedCount || '',
      usecaseUpdatesCount: record.usecaseUpdatesCount || '',
    })
    setSelectedMonth(record.month)
    setSelectedYear(record.year)
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this performance record?')) return

    try {
      await productivityService.deleteProductivityLog(id)
      setProductivity(productivity.filter(p => p.id !== id))
      setSuccessMessage('Performance data deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete performance data'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      memberId: '',
      memberName: '',
      tasksCompleted: '',
      tasksTarget: '',
      reportsSubmitted: '',
      reportsTarget: '',
      milestonesClosedCount: '',
      usecaseUpdatesCount: '',
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="card p-8 text-center">
          <p className="text-lg text-muted">Loading productivity data...</p>
        </div>
      </div>
    )
  }

  // Admin View - Team Productivity
  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Team Productivity</h1>
        <p className="text-muted">Track and manage team member performance metrics</p>
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
      <div className="card p-4 bg-gradient-to-r from-green-50 to-blue-50 flex flex-wrap gap-4 items-end">
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
          {showAddForm ? 'Cancel' : '+ Add/Update Performance'}
        </button>
      </div>

      {/* Add Performance Form */}
      {showAddForm && (
        <div className="card p-6 bg-green-50 border-2 border-green-200">
          <h2 className="text-xl font-bold text-dark mb-4">
            {editingId ? 'Edit' : 'Enter'} {selectedMonth} {selectedYear} Performance Data
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Team Member Name *</label>
              <input
                type="text"
                name="memberName"
                placeholder="e.g. John Doe"
                value={formData.memberName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Tasks Completed</label>
              <input
                type="number"
                name="tasksCompleted"
                placeholder="e.g. 12"
                value={formData.tasksCompleted}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Tasks Target</label>
              <input
                type="number"
                name="tasksTarget"
                placeholder="e.g. 15"
                value={formData.tasksTarget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Reports Submitted</label>
              <input
                type="number"
                name="reportsSubmitted"
                placeholder="e.g. 4"
                value={formData.reportsSubmitted}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Reports Target</label>
              <input
                type="number"
                name="reportsTarget"
                placeholder="e.g. 4"
                value={formData.reportsTarget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Milestones Closed</label>
              <input
                type="number"
                name="milestonesClosedCount"
                placeholder="e.g. 2"
                value={formData.milestonesClosedCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">Usecase Updates</label>
              <input
                type="number"
                name="usecaseUpdatesCount"
                placeholder="e.g. 3"
                value={formData.usecaseUpdatesCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-end gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update Performance' : 'Save Performance Data'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary KPIs */}
      {monthData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard icon="" label="Team Avg Score" value={`${summaryData.avgScore} / 10`} />
          <KPICard icon="" label="Total Tasks Completed" value={summaryData.totalTasks} />
          <KPICard icon="" label="Total Reports Submitted" value={summaryData.totalReports} />
          <KPICard icon="" label="Avg Task Completion" value={`${summaryData.avgTaskCompletion}%`} />
        </div>
      )}

      {/* Team Member Details Table */}
      {monthData.length > 0 ? (
        <div className="card p-6">
          <h2 className="card-title mb-6">Team Member Performance Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-dark">Team Member</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Month/Year</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Tasks</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Reports</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Milestones</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Usecases</th>
                  <th className="text-right py-3 px-4 font-semibold text-dark">Score</th>
                  <th className="text-right py-3 px-4 font-semibold text-dark">Performance</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthData.map((member, idx) => {
                  const score = parseFloat(calculateScore(member))
                  const performanceClass = score >= 8 ? 'badge-success' : score >= 6 ? 'badge-info' : 'badge-warning'

                  return (
                    <tr key={idx} className="border-b border-border hover:bg-light transition-colors">
                      <td className="py-4 px-4 text-dark font-medium">{member.memberName || `Team Member ${member.memberId}`}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-primary">{member.month} {member.year}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold">{member.tasksCompleted}/{member.tasksTarget}</span>
                        <p className="text-xs text-muted">
                          {member.tasksTarget > 0 ? ((member.tasksCompleted / member.tasksTarget) * 100).toFixed(0) : 0}%
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold">{member.reportsSubmitted}/{member.reportsTarget}</span>
                        <p className="text-xs text-muted">
                          {member.reportsTarget > 0 ? ((member.reportsSubmitted / member.reportsTarget) * 100).toFixed(0) : 0}%
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-primary">{member.milestonesClosedCount}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-secondary">{member.usecaseUpdatesCount}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-lg font-bold text-dark">{score} / 10</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`badge ${performanceClass}`}>
                          {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-primary text-xs hover:underline font-medium mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
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
      ) : (
        <div className="card p-12 text-center bg-gray-50">
          <p className="text-xl text-muted mb-2">No performance data available</p>
          <p className="text-sm text-muted">Add team member performance data using the form above</p>
        </div>
      )}

      {/* Team Score Chart */}
      {scoreChartData.length > 0 && (
        <div className="card p-6">
          <h2 className="card-title mb-6">Team Scores - {selectedMonth} {selectedYear}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip formatter={(value) => `${value} / 10`} />
              <Bar dataKey="score" fill="#17B890" name="Productivity Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Scoring Formula Info */}
      <div className="card p-6 bg-blue-50 border-l-4 border-l-primary">
        <h3 className="font-semibold text-dark mb-3">Productivity Score Formula</h3>
        <ul className="space-y-2 text-sm text-dark">
          <li>Score = (Tasks% × 30%) + (Reports% × 25%) + (Milestones% × 25%) + (Usecases% × 20%)</li>
          <li>Tasks% = Tasks Completed / Tasks Target × 100</li>
          <li>Reports% = Reports Submitted / Reports Target × 100</li>
          <li>Milestones% = (Milestones Closed × 10%), capped at 100%</li>
          <li>Usecases% = (Usecase Updates × 10%), capped at 100%</li>
        </ul>
      </div>
    </div>
  )
}

export default TeamProductivity
