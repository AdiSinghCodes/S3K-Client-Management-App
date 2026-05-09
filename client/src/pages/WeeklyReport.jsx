import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import reportService from '../services/report.service'
import ProgressBar from '../components/ui/ProgressBar'

const WeeklyReport = () => {
  const { user } = useAuth()
  console.log('WeeklyReport component loaded, user:', user)
  
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Initialize with current month
  const currentMonth = new Date().toLocaleString('default', { month: 'short' })
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedWeek, setSelectedWeek] = useState('1')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    clientName: '',
    achievements: '',
    challenges: '',
    blockers: '',
    nextWeekPlan: '',
    clientFeedback: '',
    assistance: '',
  })

  // Calculate week start date from month and week number
  const getWeekStartDate = (month, week) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthIndex = monthNames.indexOf(month)
    const year = new Date().getFullYear()
    const firstDayOfMonth = new Date(year, monthIndex, 1)
    const weekStartDate = new Date(firstDayOfMonth)
    weekStartDate.setDate(firstDayOfMonth.getDate() + (week - 1) * 7)
    return weekStartDate
  }

  const getWeekDateRange = (month, week) => {
    const startDate = getWeekStartDate(month, week)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    return {
      startDate,
      endDate,
      startStr: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      endStr: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  }

  // Fetch reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        console.log('Fetching reports from API...')
        const response = await reportService.getReports()
        console.log('Full API response:', response)
        console.log('Response keys:', Object.keys(response))
        const reportsData = response.reports || response.data || response || []
        console.log('Extracted reports data:', reportsData)
        console.log('Is array?', Array.isArray(reportsData))
        console.log('Reports count:', Array.isArray(reportsData) ? reportsData.length : 0)
        setReports(Array.isArray(reportsData) ? reportsData : [])
        setError('')
      } catch (err) {
        console.error('Error fetching reports:', err)
        console.error('Error type:', typeof err)
        console.error('Error keys:', Object.keys(err || {}))
        setError(`Failed to fetch reports: ${err?.message || JSON.stringify(err)}`)
        setReports([])
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // Get reports for selected month and week
  const getReportForWeek = (month, week) => {
    const weekRange = getWeekDateRange(month, week)
    return reports.find((r) => {
      try {
        const reportDate = new Date(r.week_start_date)
        if (isNaN(reportDate.getTime())) return false
        return reportDate >= weekRange.startDate && reportDate <= new Date(weekRange.endDate.getTime() + 86400000)
      } catch (e) {
        console.error('Error parsing report date:', r.week_start_date, e)
        return false
      }
    })
  }

  // Filter reports based on role
  // For Senior Management: show ALL reports from all team members
  // For Team Members: show only their own reports
  const isFounder = user?.role === 'senior_management' || user?.role === 'admin'
  const displayReports = useMemo(() => {
    if (!user) return []
    
    console.log('Filtering reports for display:')
    console.log('- isFounder:', isFounder)
    console.log('- Total reports:', reports.length)

    if (isFounder) {
      // Senior Management sees ALL reports
      console.log('Senior Management: showing all reports')
      return reports
    } else {
      // Team Members see only their own reports
      const filtered = reports.filter(r => r.user_id === user?.id)
      console.log('Team Member: showing only own reports -', filtered.length)
      return filtered
    }
  }, [reports, isFounder, user?.id, user])

  // Current report for selected week
  const currentReport = useMemo(() => {
    return getReportForWeek(selectedMonth, parseInt(selectedWeek))
  }, [selectedMonth, selectedWeek, reports])

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
      const weekRange = getWeekDateRange(selectedMonth, parseInt(selectedWeek))
      const reportData = {
        month: selectedMonth,
        weekNumber: parseInt(selectedWeek),
        week_start_date: weekRange.startDate.toISOString().split('T')[0],
        ...formData,
        status: 'submitted',
      }

      console.log('Submitting report:', reportData)

      if (editingId) {
        await reportService.updateReport(editingId, reportData)
        setSuccessMessage('Report updated successfully!')
      } else {
        await reportService.createReport(reportData)
        setSuccessMessage('Report submitted successfully!')
      }

      // Refetch data
      const response = await reportService.getReports()
      console.log('Refetched reports:', response)
      setReports(response.reports || response.data || [])

      setTimeout(() => setSuccessMessage(''), 3000)
      setFormData({
        subject: '',
        body: '',
        clientName: '',
        achievements: '',
        challenges: '',
        blockers: '',
        nextWeekPlan: '',
        clientFeedback: '',
        assistance: '',
      })
      setEditingId(null)
      setShowForm(false)
    } catch (err) {
      console.error('Error saving report:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save report'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    try {
      await reportService.deleteReport(id)
      setReports(reports.filter(r => r.id !== id))
      setSuccessMessage('Report deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete report'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      subject: '',
      body: '',
      clientName: '',
      achievements: '',
      challenges: '',
      blockers: '',
      nextWeekPlan: '',
      clientFeedback: '',
      assistance: '',
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleNewReport = () => {
    setEditingId(null)
    setFormData({
      subject: '',
      body: '',
      clientName: '',
      achievements: '',
      challenges: '',
      blockers: '',
      nextWeekPlan: '',
      clientFeedback: '',
      assistance: '',
    })
    setShowForm(true)
  }

  const handleEdit = (report) => {
    setEditingId(report.id)
    setFormData({
      subject: report.subject || '',
      body: report.body || '',
      clientName: report.clientName || '',
      achievements: report.achievements || '',
      challenges: report.challenges || '',
      blockers: report.blockers || '',
      nextWeekPlan: report.next_week_plan || '',
      clientFeedback: report.client_feedback || '',
      assistance: report.assistance_needed || '',
    })
    setShowForm(true)
  }

  const weekDateRange = getWeekDateRange(selectedMonth, parseInt(selectedWeek))

  console.log('Rendering WeeklyReport - loading:', loading, 'error:', error, 'reports:', reports.length)

  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Weekly Report</h1>
        <p className="text-muted">Submit and track weekly progress reports</p>
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

      {/* Loading State */}
      {loading && (
        <div className="card p-8 text-center bg-indigo-50">
          <p className="text-muted">Loading reports...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Main Content - Only show if not loading */}
      {!loading && (
        <>
          {/* Month, Week Selector and Date Display */}
          <div className="card p-6 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Select Week</label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1">Week 1</option>
                  <option value="2">Week 2</option>
                  <option value="3">Week 3</option>
                  <option value="4">Week 4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Week Dates</label>
                <div className="px-4 py-2 border border-border rounded-lg bg-white">
                  <p className="text-sm font-semibold text-dark">{weekDateRange.startStr} - {weekDateRange.endStr}</p>
                </div>
              </div>
              <button onClick={handleNewReport} className="btn-primary w-full">
                {currentReport ? '✎ Edit Report' : '+ New Report'}
              </button>
            </div>
          </div>

      {/* Submission Stats */}
      {/* Removed: Reports Submitted, Submission Rate, Current Status boxes */}

          {/* Report Form */}
          {showForm && (
            <div className="card p-6 bg-indigo-50 border-2 border-indigo-200">
              <h2 className="text-xl font-bold text-dark mb-4">
                {editingId ? 'Edit' : 'Submit'} Weekly Report - {selectedMonth} Week {selectedWeek}
              </h2>
              <p className="text-sm text-muted mb-4">{weekDateRange.startStr} - {weekDateRange.endStr}</p>
              
              {/* Submitted By Section */}
              <div className="mb-6 p-4 bg-white border border-indigo-300 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-xs text-muted">Submitted by</p>
                    <p className="text-lg font-bold text-dark">{user?.name || 'Team Member'}</p>
                    <p className="text-xs text-muted mt-1">Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Weekly report subject/title"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Client Name</label>
                    <input
                      type="text"
                      placeholder="Name of the client you're reporting about"
                      value={formData.clientName || user?.name}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Body/Summary</label>
                  <textarea
                    name="body"
                    placeholder="Overall summary of the week's work and progress..."
                    value={formData.body}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">This Week Achievements</label>
                  <textarea
                    name="achievements"
                    placeholder="List key accomplishments, completed tasks, deliverables..."
                    value={formData.achievements}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Challenges Faced</label>
                  <textarea
                    name="challenges"
                    placeholder="Describe any obstacles or difficulties encountered..."
                    value={formData.challenges}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Blockers</label>
                  <textarea
                    name="blockers"
                    placeholder="Any issues blocking progress? What help is needed?"
                    value={formData.blockers}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Next Week Plan</label>
                  <textarea
                    name="nextWeekPlan"
                    placeholder="What are you planning to do next week? Goals and priorities..."
                    value={formData.nextWeekPlan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Client Feedback</label>
                  <textarea
                    name="clientFeedback"
                    placeholder="Any feedback from client? Requests? Changes?"
                    value={formData.clientFeedback}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Assistance Required</label>
                  <textarea
                    name="assistance"
                    placeholder="Is there any assistance needed from management or team?"
                    value={formData.assistance}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update Report' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-border rounded-lg text-dark hover:bg-light"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Report Display */}
          {currentReport && !showForm && (
            <div className="card p-6 bg-green-50 border-2 border-green-200">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-dark">{currentReport.subject || `Week ${selectedWeek} Report`}</h3>
                  <p className="text-sm text-muted">{weekDateRange.startStr} - {weekDateRange.endStr}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(currentReport)}
                    className="text-primary text-sm hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={() => handleDelete(currentReport.id)}
                    className="text-red-600 text-sm hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Submitted By Section */}
              {currentReport.sent_by && (
                <div className="mb-6 p-4 bg-white border border-green-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                      {currentReport.sent_by?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-xs text-muted">Submitted by</p>
                      <p className="text-lg font-bold text-dark">{currentReport.sent_by}</p>
                      <p className="text-xs text-muted mt-1">Week {selectedWeek} Report</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {currentReport.body && (
                  <div>
                    <h4 className="font-semibold text-dark mb-2">Summary</h4>
                    <p className="text-sm text-dark whitespace-pre-wrap">{currentReport.body}</p>
                  </div>
                )}

                {currentReport.achievements && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-dark mb-2">Achievements</h4>
                    <p className="text-sm text-dark whitespace-pre-wrap">{currentReport.achievements}</p>
                  </div>
                )}

                {currentReport.challenges && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-dark mb-2">Challenges</h4>
                    <p className="text-sm text-dark whitespace-pre-wrap">{currentReport.challenges}</p>
                  </div>
                )}

                {currentReport.blockers && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-dark mb-2">Blockers</h4>
                    <p className="text-sm text-dark whitespace-pre-wrap">{currentReport.blockers}</p>
                  </div>
                )}

                {currentReport.next_week_plan && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-dark mb-2">Next Week Plan</h4>
                    <p className="text-sm text-dark whitespace-pre-wrap">{currentReport.next_week_plan}</p>
                  </div>
                )}

                {currentReport.client_feedback && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-dark mb-2">Client Feedback</h4>
                    <p className="text-sm text-dark whitespace-pre-wrap">{currentReport.client_feedback}</p>
                  </div>
                )}

                {currentReport.assistance_needed && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-dark mb-2">Assistance Required</h4>
                    <p className="text-sm text-dark whitespace-pre-wrap">{currentReport.assistance_needed}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Submitted Reports */}
          {displayReports.length > 0 ? (
            <div className="card p-6">
              <h2 className="card-title mb-6">
                {isFounder ? 'All Team Reports' : 'Your Reports'}
              </h2>
              <div className="space-y-4">
                {displayReports.map((report) => {
                  const reportDate = new Date(report.week_start_date)
                  const dateStr = reportDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  
                  // Check if current user can edit/delete this report
                  const canEdit = isFounder || report.user_id === user?.id
                  const canDelete = isFounder || report.user_id === user?.id

                  return (
                    <div key={report.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Report Header */}
                      <div className="p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-dark">{report.subject || 'Weekly Report'}</h4>
                              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                ✓ {report.status || 'Submitted'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-muted mt-1">
                              <span>📅 {dateStr}</span>
                              {isFounder && report.sent_by && (
                                <span>👤 <strong>{report.sent_by}</strong></span>
                              )}
                            </div>
                          </div>
                          
                          {/* Edit/Delete Buttons with role-based permissions */}
                          <div className="flex gap-2 ml-4">
                            {canEdit && (
                              <button
                                onClick={() => handleEdit(report)}
                                className="text-primary text-sm hover:underline font-medium px-3 py-1 hover:bg-blue-50 rounded transition"
                                title="Edit report"
                              >
                                ✎ Edit
                              </button>
                            )}
                            {canDelete && (
                              <>
                                {canEdit && canDelete && <span className="text-border">|</span>}
                                <button
                                  onClick={() => handleDelete(report.id)}
                                  className="text-red-600 text-sm hover:underline font-medium px-3 py-1 hover:bg-red-50 rounded transition"
                                  title="Delete report"
                                >
                                  🗑 Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Preview Content */}
                        {report.body && (
                          <p className="text-sm text-dark mb-2 p-2 bg-light rounded">
                            <span className="font-semibold">Summary:</span> {report.body.substring(0, 100)}{report.body.length > 100 ? '...' : ''}
                          </p>
                        )}
                        
                        {report.achievements && (
                          <p className="text-sm text-dark p-2 bg-green-50 rounded">
                            <span className="font-semibold text-green-700">✓ Achievement:</span> {report.achievements.substring(0, 100)}{report.achievements.length > 100 ? '...' : ''}
                          </p>
                        )}
                        
                        {report.challenges && (
                          <p className="text-sm text-dark p-2 bg-orange-50 rounded mt-2">
                            <span className="font-semibold text-orange-700">⚠️ Challenges:</span> {report.challenges.substring(0, 100)}{report.challenges.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-gray-50">
              <p className="text-xl text-muted mb-2">
                {isFounder ? 'No reports submitted yet' : 'You haven\'t submitted any reports yet'}
              </p>
              <p className="text-sm text-muted">
                {isFounder 
                  ? 'Team members will submit their reports here' 
                  : 'Start by submitting your first weekly report using the form above'
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WeeklyReport
