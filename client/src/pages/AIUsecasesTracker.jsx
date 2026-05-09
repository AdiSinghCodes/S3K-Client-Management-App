import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import usecaseService from '../services/usecase.service'
import ProgressBar from '../components/ui/ProgressBar'

const AIUsecasesTracker = () => {
  const { user } = useAuth()
  const isFounder = user?.role === 'senior_management' || user?.role === 'admin'
  const [usecases, setUsecases] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    use_case_name: '',
    assigned_to: '',
    progress: 0,
    phase_ideation: false,
    phase_design: false,
    phase_development: false,
    phase_uat: false,
    phase_live: false,
    go_live_date: '',
    start_date: '',
    expected_end_date: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch use cases on mount
  useEffect(() => {
    const fetchUsecases = async () => {
      try {
        setLoading(true)
        const response = await (isFounder ? usecaseService.getUseCases() : usecaseService.getMyUseCases())
        console.log('Use cases response:', response)
        setUsecases(response.useCases || response.data || [])
        setError('')
      } catch (err) {
        console.error('Error fetching use cases:', err)
        setError('Failed to fetch use cases')
        setUsecases([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsecases()
  }, [isFounder])

  // Fetch team members for dropdown
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // Fetch all users to display in dropdown
        const response = await usecaseService.getUseCases()
        // For now, we'll use a static list - in production, create a dedicated endpoint
        // Getting users from localStorage or make an API call
        // For MVP, we'll populate from company_team_members if available
        setTeamMembers([
          { id: user?.id, name: user?.name || 'Current User' },
          // Add more team members here or fetch from API
        ])
      } catch (err) {
        console.error('Error fetching team members:', err)
      }
    }

    fetchTeamMembers()
  }, [user])

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'badge-success'
      case 'planning':
        return 'badge-info'
      case 'completed':
        return 'badge-secondary'
      case 'on_hold':
        return 'badge-warning'
      default:
        return 'badge-info'
    }
  }

  // Chart data
  const chartData = useMemo(() => {
    return usecases.map((uc) => ({
      name: uc.name,
      completion: uc.completion || 0,
      remaining: 100 - (uc.completion || 0),
    }))
  }, [usecases])

  // Summary stats
  const summaryStats = useMemo(() => {
    const total = usecases.length
    const inProgress = usecases.filter((uc) => (uc.progress || 0) > 0 && (uc.progress || 0) < 100).length
    const completed = usecases.filter((uc) => (uc.progress || 0) === 100 || uc.phase_live).length
    const avgCompletion = total > 0 ? (usecases.reduce((sum, uc) => sum + (uc.progress || 0), 0) / total).toFixed(0) : 0

    return {
      total,
      inProgress,
      completed,
      avgCompletion,
    }
  }, [usecases])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress' ? Math.min(100, Math.max(0, parseInt(value))) : value === '' ? '' : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.use_case_name) {
      setErrorMessage('Please fill in all required fields')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    // For team members, auto-assign to themselves
    const assignedTo = isFounder ? formData.assigned_to : user?.id;
    
    if (!assignedTo) {
      setErrorMessage('Unable to determine assigned user')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    // Convert empty strings to null for optional date fields and assigned_to to integer
    const submitData = {
      ...formData,
      assigned_to: parseInt(assignedTo),
      start_date: formData.start_date || null,
      expected_end_date: formData.expected_end_date || null,
      go_live_date: formData.go_live_date || null,
    }

    try {
      if (editingId) {
        // UPDATE existing use case
        console.log('Updating use case:', editingId, submitData)
        await usecaseService.updateUseCase(editingId, submitData)
        setSuccessMessage('Use case updated successfully!')
        // Refetch data
        const response = isFounder ? await usecaseService.getUseCases() : await usecaseService.getMyUseCases()
        console.log('Refetched use cases after update:', response)
        setUsecases(response.useCases || response.data || [])
        setEditingId(null)
      } else {
        // CREATE new use case
        const response = await usecaseService.createUseCase(submitData)
        setSuccessMessage('Use case created successfully!')
        // Refetch data
        const allResponse = isFounder ? await usecaseService.getUseCases() : await usecaseService.getMyUseCases()
        setUsecases(allResponse.useCases || allResponse.data || [])
      }

      setFormData({
        use_case_name: '',
        assigned_to: '',
        progress: 0,
        phase_ideation: false,
        phase_design: false,
        phase_development: false,
        phase_uat: false,
        phase_live: false,
        go_live_date: '',
        start_date: '',
        expected_end_date: '',
      })
      setShowAddForm(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error saving use case:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to save use case')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleUpdateCompletion = (id, newCompletion) => {
    setUsecases(
      usecases.map((uc) =>
        uc.id === id
          ? {
              ...uc,
              completion: newCompletion,
              status: newCompletion === 100 ? 'Completed' : 'In Progress',
              currentPhase: newCompletion === 100 ? 'Go-Live' : uc.currentPhase,
            }
          : uc,
      ),
    )
  }

  const handleEdit = async (usecase) => {
    setEditingId(usecase.id)
    setFormData({
      use_case_name: usecase.use_case_name || '',
      assigned_to: usecase.assigned_to || '',
      progress: usecase.progress || 0,
      phase_ideation: usecase.phase_ideation || false,
      phase_design: usecase.phase_design || false,
      phase_development: usecase.phase_development || false,
      phase_uat: usecase.phase_uat || false,
      phase_live: usecase.phase_live || false,
      go_live_date: usecase.go_live_date || '',
      start_date: usecase.start_date || '',
      expected_end_date: usecase.expected_end_date || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this use case?')) return

    try {
      await usecaseService.deleteUseCase(id)
      setSuccessMessage('Use case deleted successfully!')
      setUsecases(usecases.filter(uc => uc.id !== id))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting use case:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to delete use case')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  if (!isFounder) {
    return (
      <div className="space-y-8 pt-12 px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-3">My AI Use Cases</h1>
          <p className="text-lg text-muted">Track your assigned AI implementation projects</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card p-8 text-center bg-blue-50">
            <p className="text-muted">Loading your use cases...</p>
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
        {/* Action Button - ADD USE CASE for Team */}
        <div className="card p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? 'Cancel' : '+ Add Use Case'}
          </button>
        </div>

        {/* Add Use Case Form - For Team Members */}
        {showAddForm && (
          <div className="card p-6 bg-blue-50 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark">{editingId ? 'Edit AI Use Case' : 'Add New AI Use Case'}</h2>
              <button
                onClick={() => {
                  setEditingId(null)
                  setShowAddForm(false)
                  setFormData({
                    use_case_name: '',
                    assigned_to: '',
                    progress: 0,
                    phase_ideation: false,
                    phase_design: false,
                    phase_development: false,
                    phase_uat: false,
                    phase_live: false,
                    go_live_date: '',
                    start_date: '',
                    expected_end_date: '',
                  })
                }}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
                ✓ {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                ✕ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Use Case Name *</label>
                <input
                  type="text"
                  name="use_case_name"
                  placeholder="e.g. Document Classification"
                  value={formData.use_case_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Current Phase *</label>
                <select
                  name="phase_ideation"
                  onChange={(e) => {
                    const phase = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      phase_ideation: phase === 'ideation',
                      phase_design: phase === 'design',
                      phase_development: phase === 'development',
                      phase_uat: phase === 'uat',
                      phase_live: phase === 'live',
                    }))
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Phase</option>
                  <option value="ideation">Ideation</option>
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="uat">UAT</option>
                  <option value="live">Live</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Completion % *</label>
                <input
                  type="number"
                  name="progress"
                  placeholder="0-100"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Expected End Date</label>
                <input
                  type="date"
                  name="expected_end_date"
                  value={formData.expected_end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Go-Live Date</label>
                <input
                  type="date"
                  name="go_live_date"
                  value={formData.go_live_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button type="submit" className="btn-primary md:col-span-2">
                {editingId ? 'Update Use Case' : 'Add Use Case'}
              </button>
            </form>
          </div>
        )}

            {/* My Use Cases List */}
            <div className="space-y-4">
              {usecases.length === 0 ? (
                <div className="card p-8 text-center bg-gray-50">
                  <p className="text-gray-600">No use cases assigned yet</p>
                </div>
              ) : (
                usecases.map((usecase) => {
                  // Determine current phase from boolean fields
                  const getCurrentPhase = () => {
                    if (usecase.phase_live) return 'Live'
                    if (usecase.phase_uat) return 'UAT'
                    if (usecase.phase_development) return 'Development'
                    if (usecase.phase_design) return 'Design'
                    if (usecase.phase_ideation) return 'Ideation'
                    return 'Pending'
                  }

                  return (
              <div key={usecase.id} className="card p-6 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-dark">{usecase.use_case_name}</h3>
                    <p className="text-sm text-muted">Completion: {usecase.progress}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(usecase)}
                      className="text-primary text-sm hover:underline font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(usecase.id)}
                      className="text-red-600 text-sm hover:underline font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted">Phase</p>
                    <p className="text-dark font-medium">{getCurrentPhase()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted">Completion</p>
                    <p className="text-dark font-medium">{usecase.progress}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted">Start Date</p>
                    <p className="text-dark font-medium">{usecase.start_date ? new Date(usecase.start_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted">Go-Live Date</p>
                    <p className="text-dark font-medium">{usecase.go_live_date ? new Date(usecase.go_live_date).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </div>
              )
              })
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dark mb-3">AI Use Cases Tracker</h1>
        <p className="text-lg text-muted">Track progress of AI implementation projects across all clients</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card p-8 text-center bg-teal-50">
          <p className="text-muted">Loading use cases...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      )}

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

      {/* Main Content - Only show if not loading */}
      {!loading && (
        <>
      {/* Action Button */}
      <div className="card p-4 bg-gradient-to-r from-teal-50 to-cyan-50">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ New Use Case'}
        </button>
      </div>

      {/* Add Use Case Form */}
      {showAddForm && (
        <div className="card p-6 bg-teal-50 border-2 border-teal-200">
          <h2 className="text-xl font-bold text-dark mb-4">{editingId ? 'Edit Use Case' : 'Add New AI Use Case'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Use Case Name *</label>
              <input
                type="text"
                name="use_case_name"
                placeholder="e.g. Document Classification"
                value={formData.use_case_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Assigned To *</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select team member...</option>
                {user && (
                  <option value={user.id}>{user.name} (You)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Progress: {formData.progress}%</label>
              <input
                type="range"
                name="progress"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Expected End Date</label>
              <input
                type="date"
                name="expected_end_date"
                value={formData.expected_end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Project Phases</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="phase_ideation"
                    checked={formData.phase_ideation}
                    onChange={(e) => setFormData({...formData, phase_ideation: e.target.checked})}
                    className="w-4 h-4 text-primary border border-border rounded"
                  />
                  <span className="ml-2 text-sm text-dark">Ideation</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="phase_design"
                    checked={formData.phase_design}
                    onChange={(e) => setFormData({...formData, phase_design: e.target.checked})}
                    className="w-4 h-4 text-primary border border-border rounded"
                  />
                  <span className="ml-2 text-sm text-dark">Design</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="phase_development"
                    checked={formData.phase_development}
                    onChange={(e) => setFormData({...formData, phase_development: e.target.checked})}
                    className="w-4 h-4 text-primary border border-border rounded"
                  />
                  <span className="ml-2 text-sm text-dark">Development</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="phase_uat"
                    checked={formData.phase_uat}
                    onChange={(e) => setFormData({...formData, phase_uat: e.target.checked})}
                    className="w-4 h-4 text-primary border border-border rounded"
                  />
                  <span className="ml-2 text-sm text-dark">UAT</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="phase_live"
                    checked={formData.phase_live}
                    onChange={(e) => setFormData({...formData, phase_live: e.target.checked})}
                    className="w-4 h-4 text-primary border border-border rounded"
                  />
                  <span className="ml-2 text-sm text-dark">Live</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex items-end gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update Use Case' : 'Add Use Case'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                  setFormData({
                    use_case_name: '',
                    assigned_to: '',
                    progress: 0,
                    phase_ideation: false,
                    phase_design: false,
                    phase_development: false,
                    phase_uat: false,
                    phase_live: false,
                    go_live_date: '',
                    start_date: '',
                    expected_end_date: '',
                  })
                }}
                className="px-4 py-2 border border-border rounded-lg text-dark hover:bg-light"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-blue-50 border-l-4 border-l-primary">
          <p className="text-muted text-sm mb-1">Total Use Cases</p>
          <p className="text-2xl font-bold text-primary">{summaryStats.total}</p>
        </div>
        <div className="card p-6 bg-green-50 border-l-4 border-l-green-500">
          <p className="text-muted text-sm mb-1">In Progress</p>
          <p className="text-2xl font-bold text-green-600">{summaryStats.inProgress}</p>
        </div>
        <div className="card p-6 bg-purple-50 border-l-4 border-l-purple-500">
          <p className="text-muted text-sm mb-1">Completed</p>
          <p className="text-2xl font-bold text-purple-600">{summaryStats.completed}</p>
        </div>
        <div className="card p-6 bg-orange-50 border-l-4 border-l-orange-500">
          <p className="text-muted text-sm mb-1">Avg Completion</p>
          <p className="text-2xl font-bold text-orange-600">{summaryStats.avgCompletion}%</p>
        </div>
      </div>

      {/* Detailed Use Cases List */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-dark mb-4">Use Case Progress Details</h2>
        {usecases.length === 0 ? (
          <p className="text-muted text-center py-8">No use cases yet. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold text-dark">Team Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Use Case Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Progress</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Status</th>
                </tr>
              </thead>
              <tbody>
                {usecases.map((usecase) => (
                  <tr key={usecase.id} className="border-b border-border hover:bg-light">
                    <td className="py-3 px-4 text-dark font-medium">{usecase.assigned_name || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-dark">{usecase.use_case_name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${usecase.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-dark min-w-12">{usecase.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {usecase.progress === 100 || usecase.phase_live ? (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Completed</span>
                      ) : usecase.progress > 0 ? (
                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">In Progress</span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Not Started</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Use Cases List */}
      <div className="space-y-4">
        {usecases.length === 0 ? (
          <div className="card p-8 text-center bg-gray-50">
            <p className="text-muted">No use cases yet. Add one to get started.</p>
          </div>
        ) : (
          usecases.map((usecase) => (
            <div key={usecase.id} className="card p-6 border-l-4 border-l-teal-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-dark">{usecase.use_case_name}</h3>
                  <p className="text-sm text-muted">Created: {new Date(usecase.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(usecase)}
                    className="text-primary text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={() => handleDelete(usecase.id)}
                    className="text-red-600 hover:text-red-700 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">Assigned To</p>
                  <p className="text-sm text-dark font-medium">{usecase.assigned_name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">Start Date</p>
                  <p className="text-sm text-dark">{usecase.start_date ? new Date(usecase.start_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">Expected End Date</p>
                  <p className="text-sm text-dark">{usecase.expected_end_date ? new Date(usecase.expected_end_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">Go-Live Date</p>
                  <p className="text-sm text-dark">{usecase.go_live_date ? new Date(usecase.go_live_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">Active Phases</p>
                  <div className="text-sm text-dark space-y-0.5">
                    {usecase.phase_ideation && <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-1">Ideation</span>}
                    {usecase.phase_design && <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs mr-1">Design</span>}
                    {usecase.phase_development && <span className="inline-block bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs mr-1">Dev</span>}
                    {usecase.phase_uat && <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs mr-1">UAT</span>}
                    {usecase.phase_live && <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs mr-1">Live</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Timeline Chart */}
      {usecases.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-dark mb-6">Use Case Statistics</h2>
          <p className="text-muted text-sm">Total use cases created: {usecases.length}</p>
        </div>
      )}
      </>
      )}
    </div>
  )
}

export default AIUsecasesTracker
