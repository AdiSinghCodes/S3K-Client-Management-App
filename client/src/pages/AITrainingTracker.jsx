import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import trainingService from '../services/training.service'

// Helper function to extract YYYY-MM-DD from date string or timestamp
const formatDateForInput = (dateValue) => {
  if (!dateValue) return ''
  
  // If it's already in YYYY-MM-DD format, return as is
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue
  }
  
  // If it's an ISO string or timestamp, extract the date part
  const date = new Date(dateValue)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }
  
  return ''
}

const AITrainingTracker = () => {
  const { user } = useAuth()
  const isFounder = user?.role === 'senior_management' || user?.role === 'admin'
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    trainer: '',
    topic: '',
    date: '',
    duration: '',
    participants: '',
    notes: '',
    status: 'scheduled',
  })

  // Fetch trainings on mount
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true)
        const response = await trainingService.getTrainings()
        console.log('Trainings response:', response)
        setTrainings(response.trainings || response.data || [])
        setError('')
      } catch (err) {
        console.error('Error fetching trainings:', err)
        setError('Failed to fetch trainings')
        setTrainings([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrainings()
  }, [])

  // Filter trainings based on role
  const visibleTrainings = isFounder ? trainings : trainings.filter(t => t.user_id === user?.id)

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
      const trainingData = {
        ...formData,
        // Ensure date is in YYYY-MM-DD format
        date: formatDateForInput(formData.date),
      }
      console.log('Submitting training data:', trainingData)

      if (editingId) {
        console.log('Updating training:', editingId, trainingData)
        const response = await trainingService.updateTraining(editingId, trainingData)
        console.log('Update response:', response)
        setSuccessMessage('Training updated successfully!')
        // Refetch all trainings
        const allResponse = await trainingService.getTrainings()
        console.log('Refetched trainings after update:', allResponse)
        setTrainings(allResponse.trainings || allResponse.data || [])
      } else {
        console.log('Creating training:', trainingData)
        const response = await trainingService.createTraining(trainingData)
        console.log('Training created response:', response)
        setSuccessMessage('Training added successfully!')
        // Refetch all trainings
        const allResponse = await trainingService.getTrainings()
        setTrainings(allResponse.trainings || allResponse.data || [])
      }

      setTimeout(() => setSuccessMessage(''), 3000)
      setFormData({
        title: '',
        trainer: '',
        topic: '',
        date: '',
        duration: '',
        participants: '',
        notes: '',
        status: 'scheduled',
      })
      setEditingId(null)
      setShowForm(false)
    } catch (err) {
      console.error('Training save error:', err)
      console.error('Error details:', err.response?.data || err.message)
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save training'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleEdit = (training) => {
    setEditingId(training.id)
    setFormData({
      title: training.training_name || training.title || '',
      trainer: training.trainer || '',
      topic: training.topic || '',
      date: formatDateForInput(training.training_date || training.date || ''),
      duration: training.duration_hours || training.duration || '',
      participants: training.participants || '',
      notes: training.notes || '',
      status: training.status || 'scheduled',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training?')) return

    try {
      console.log('Deleting training:', id)
      await trainingService.deleteTraining(id)
      console.log('Training deleted successfully')
      setTrainings(trainings.filter(t => t.id !== id))
      setSuccessMessage('Training deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Delete training error:', err)
      console.error('Error details:', err.response?.data || err.message)
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete training'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      trainer: '',
      topic: '',
      date: '',
      duration: '',
      participants: '',
      notes: '',
      status: 'scheduled',
    })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">AI Training Tracker</h1>
        <p className="text-muted">Track all training sessions and team learning progress</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-blue-50 border-l-4 border-l-primary">
          <p className="text-muted text-sm mb-1">Total Trainings</p>
          <p className="text-2xl font-bold text-primary">{trainings.length}</p>
        </div>
        <div className="card p-6 bg-green-50 border-l-4 border-l-green-500">
          <p className="text-muted text-sm mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{trainings.filter(t => t.status === 'completed').length}</p>
        </div>
        <div className="card p-6 bg-secondary-100 border-l-4 border-l-secondary">
          <p className="text-muted text-sm mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-secondary">{trainings.filter(t => t.status === 'scheduled').length}</p>
        </div>
      </div>

      {/* Training Form */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="card-title">{editingId ? 'Edit Training Session' : 'Add New Training Session'}</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`btn-${showForm ? 'secondary' : 'primary'}`}
          >
            {showForm ? '✕ Cancel' : '+ Add Training'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Training Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Python AI Fundamentals"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Trainer Name</label>
                <input
                  type="text"
                  name="trainer"
                  value={formData.trainer}
                  onChange={handleInputChange}
                  placeholder="e.g., Sameer Singh"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Topic/Subject</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Machine Learning"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Training Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Duration (hours)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  min="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Number of Participants</label>
                <input
                  type="number"
                  name="participants"
                  value={formData.participants}
                  onChange={handleInputChange}
                  placeholder="e.g., 15"
                  min="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Training Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-dark block mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any relevant information about the training..."
                rows="3"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 btn-primary">
                {editingId ? 'Update Training' : 'Add Training'}
              </button>
              <button type="button" onClick={handleCancel} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Training List */}
      <div className="card p-6">
        <h2 className="card-title mb-6">{isFounder ? 'All Training Sessions' : 'Your Training Sessions'}</h2>
        <div className="space-y-4">
          {visibleTrainings.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 rounded-lg">
              <p className="text-muted">{loading ? 'Loading...' : 'No trainings found'}</p>
            </div>
          ) : (
            visibleTrainings.map((training) => (
              <div key={training.id} className="p-4 border border-border rounded-lg hover:bg-light transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-dark">{training.training_name || training.title}</h3>
                    <p className="text-sm text-muted mt-1">
                      Trainer: {training.trainer} | Date: {training.training_date || training.date || 'N/A'} | Duration: {training.duration_hours || training.duration || 'N/A'} hrs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(training)}
                      className="text-primary text-sm hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <span className="text-border">|</span>
                    <button
                      onClick={() => handleDelete(training.id)}
                      className="text-red-600 text-sm hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-dark">{training.participants} participants | Status: <span className="font-semibold text-primary">{training.status}</span></p>
                {training.notes && <p className="text-sm text-dark mt-2">Notes: {training.notes}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Important Guidelines */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <p className="text-blue-900 font-medium mb-3">📋 Training Management Guidelines</p>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>✓ All training sessions must be recorded and tracked</li>
          <li>✓ Mandatory for all assigned team members</li>
          <li>✓ Training materials and resources should be shared with participants</li>
          <li>✓ Completion certificates to be provided upon session completion</li>
          <li>✓ Feedback from participants helps improve future sessions</li>
        </ul>
      </div>
    </div>
  )
}

export default AITrainingTracker
