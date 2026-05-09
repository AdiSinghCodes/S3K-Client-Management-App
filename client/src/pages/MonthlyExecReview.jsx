import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import reviewService from '../services/review.service'

const MonthlyExecReview = () => {
  const { user } = useAuth()
  const isFounder = user?.role === 'senior_management' || user?.role === 'admin'
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedMonth, setSelectedMonth] = useState('Jun')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    company_id: 1,
    review_date: '',
    reviewer_name: user?.name || '',
    meeting_details: '',
    ctas: '',
    risks: '',
    mom: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        console.log('Fetching reviews...')
        const response = await reviewService.getReviews()
        console.log('Reviews response:', response)
        const reviewsData = response.reviews || response.data || response || []
        console.log('Extracted reviews:', reviewsData)
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
        setError('')
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to fetch reviews')
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Show ALL reviews for Senior Management, filtered by month for Team Members
  const displayReviews = useMemo(() => {
    if (!user) return []
    
    console.log('Filtering reviews:')
    console.log('- isFounder:', isFounder)
    console.log('- Total reviews:', reviews.length)

    if (isFounder) {
      // Senior Management sees ALL reviews
      console.log('Senior Management: showing all reviews')
      return reviews
    } else {
      // Team Members see only their own reviews for selected month
      const filtered = reviews.filter(r => r.user_id === user?.id)
      console.log('Team Member: showing own reviews -', filtered.length)
      return filtered
    }
  }, [reviews, isFounder, user?.id, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.review_date) {
      setErrorMessage('Review date is required')
      return
    }

    try {
      const reviewData = {
        ...formData,
        company_id: 1,  // Default company
        user_id: user?.id,
      }
      console.log('Submitting review data:', reviewData)

      if (editingId) {
        // Update existing review
        console.log('Updating review:', editingId)
        await reviewService.updateReview(editingId, reviewData)
        setSuccessMessage('Review updated successfully!')
        // Refetch all reviews
        const response = await reviewService.getReviews()
        setReviews(response.reviews || response.data || [])
        setEditingId(null)
      } else {
        // Add new review
        console.log('Creating new review')
        const response = await reviewService.createReview(reviewData)
        setSuccessMessage('Review added successfully!')
        setReviews([...reviews, response.review || response.data])
      }

      setFormData({
        company_id: 1,
        review_date: '',
        reviewer_name: user?.name || '',
        meeting_details: '',
        ctas: '',
        risks: '',
        mom: '',
      })
      setShowForm(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error saving review:', err)
      console.error('Error details:', err.response?.data || err.message)
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Failed to save review')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewService.deleteReview(id)
      setSuccessMessage('Review deleted successfully!')
      setReviews(reviews.filter(r => r.id !== id))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting review:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to delete review')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      company_id: 1,
      review_date: '',
      reviewer_name: user?.name || '',
      meeting_details: '',
      ctas: '',
      risks: '',
      mom: '',
    })
  }

  const handleEdit = (review) => {
    setEditingId(review.id)
    setFormData({
      company_id: review.company_id || 1,
      review_date: review.review_date || '',
      reviewer_name: review.reviewer_name || user?.name || '',
      meeting_details: review.meeting_details || review.highlights || '',
      ctas: review.ctas || '',
      risks: review.risks || '',
      mom: review.mom || review.mom_notes || '',
    })
    setShowForm(true)
  }

  const handleNewReview = () => {
    setEditingId(null)
    setFormData({
      company_id: 1,
      review_date: '',
      reviewer_name: user?.name || '',
      meeting_details: '',
      ctas: '',
      risks: '',
      mom: '',
    })
    setShowForm(true)
  }

  if (!isFounder) {
    return (
      <div className="space-y-8 pt-12 px-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">My Executive Reviews</h1>
          <p className="text-muted">Document your client meetings and call-to-actions (CTAs)</p>
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

      {/* Month Selector and Action Buttons */}
      <div className="card p-4 bg-gradient-to-r from-blue-50 to-cyan-50 flex flex-wrap gap-4 items-end">
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
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '✕ Cancel' : '+ Add Review'}
          </button>
        </div>

        {/* Add/Edit Review Form */}
        {showForm && (
          <div className="card p-6 bg-blue-50 border-2 border-blue-200">
            <h2 className="card-title mb-6">{editingId ? 'Edit Review' : 'Add Executive Review'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-dark block mb-2">Review Date *</label>
                  <input
                    type="date"
                    name="review_date"
                    value={formData.review_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-dark block mb-2">Reviewer Name</label>
                  <input
                    type="text"
                    name="reviewer_name"
                    value={formData.reviewer_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Aditya Singh"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Meeting Details</label>
                <textarea
                  name="meeting_details"
                  value={formData.meeting_details}
                  onChange={handleInputChange}
                  placeholder="Key highlights and discussion points..."
                  rows="3"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Call To Actions (CTAs)</label>
                <textarea
                  name="ctas"
                  value={formData.ctas}
                  onChange={handleInputChange}
                  placeholder="Action items (prefix completed items with ✓)..."
                  rows="3"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Risks</label>
                <textarea
                  name="risks"
                  value={formData.risks}
                  onChange={handleInputChange}
                  placeholder="Any risks or concerns identified..."
                  rows="2"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-dark block mb-2">Meeting of Minds (MOM) Notes</label>
                <textarea
                  name="mom"
                  value={formData.mom}
                  onChange={handleInputChange}
                  placeholder="Additional notes..."
                  rows="2"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Update Review' : 'Add Review'}
                </button>
                <button type="button" onClick={handleCancel} className="px-4 py-2 border border-border rounded-lg text-dark hover:bg-light">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {displayReviews.length === 0 ? (
            <div className="card p-8 text-center bg-gray-50">
              <p className="text-gray-600">{loading ? 'Loading...' : 'You haven\'t submitted any reviews'}</p>
            </div>
          ) : (
            displayReviews.map((review, idx) => (
              <div key={review.id} className="card p-6 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-dark">Review #{idx + 1}</h3>
                    <p className="text-sm text-muted">Date: {review.review_date ? new Date(review.review_date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-sm text-muted">Reviewer: {review.reviewer_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="text-primary text-sm hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <span className="text-border">|</span>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 text-sm hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {review.meeting_details && (
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-sm font-semibold text-dark mb-1">Meeting Details</p>
                    <p className="text-sm text-dark">{review.meeting_details}</p>
                  </div>
                )}

                {review.ctas && (
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-sm font-semibold text-dark mb-2">Action Items</p>
                    <ul className="space-y-1 text-sm text-dark">
                      {review.ctas.split('\n').map((cta, i) => (
                        cta.trim() && (
                          <li key={i} className={cta.includes('✓') ? 'line-through text-green-600' : ''}>
                            {cta}
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                )}

                {review.risks && (
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-sm font-semibold text-dark mb-1">Risks</p>
                    <p className="text-sm text-dark">{review.risks}</p>
                  </div>
                )}

                {review.mom && (
                  <div>
                    <p className="text-sm font-semibold text-dark mb-1">MOM Notes</p>
                    <p className="text-sm text-dark">{review.mom}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Monthly Executive Review</h1>
        <p className="text-muted">Document client meetings, meeting of minds (MOM), and call-to-actions (CTAs)</p>
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

      {/* Month Selector and Action Buttons */}
      <div className="card p-4 bg-gradient-to-r from-rose-50 to-pink-50 flex flex-wrap gap-4 items-end">
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
        <button onClick={handleNewReview} className="btn-primary">
          + Add Meeting Notes
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6 bg-rose-50 border-2 border-rose-200">
          <h2 className="text-xl font-bold text-dark mb-4">
            {editingId ? 'Edit' : 'Add'} Meeting Notes
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Review Date</label>
              <input
                type="date"
                name="review_date"
                value={formData.review_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Reviewer Name</label>
              <input
                type="text"
                name="reviewer_name"
                value={formData.reviewer_name}
                onChange={handleInputChange}
                placeholder="Your name (e.g., Aditya Singh)"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Meeting Details</label>
              <textarea
                name="meeting_details"
                placeholder="Document client meetings, attendees, highlights, discussion points..."
                value={formData.meeting_details}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Action Items (CTAs)</label>
              <textarea
                name="ctas"
                placeholder="Enter one action item per line. Prefix with ✓ for completed items.&#10;Example:&#10;✓ Complete document by Jun 15&#10;Follow up on contract terms&#10;Schedule next review meeting"
                value={formData.ctas}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Risks & Dependencies</label>
              <textarea
                name="risks"
                placeholder="Any risks, blockers, or dependencies to monitor..."
                value={formData.risks}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Meeting of Minds (MOM)</label>
              <textarea
                name="mom"
                placeholder="Key decisions, agreements, and mutual understanding from the meeting..."
                value={formData.mom}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update Notes' : 'Save Notes'}
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

      {/* All Submitted Reviews */}
      {loading ? (
        <div className="card p-8 text-center bg-indigo-50">
          <p className="text-muted">Loading reviews...</p>
        </div>
      ) : displayReviews.length > 0 ? (
        <div className="card p-6">
          <h2 className="card-title mb-6">
            {isFounder ? 'All Meeting Reviews' : 'Your Meeting Reviews'}
          </h2>
          <div className="space-y-4">
            {displayReviews.map((review) => {
              const reviewDate = new Date(review.review_date)
              const dateStr = reviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              
              // Check if current user can edit/delete this review
              const canEdit = isFounder || review.user_id === user?.id
              const canDelete = isFounder || review.user_id === user?.id

              return (
                <div key={review.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  {/* Review Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-dark">Meeting Review</h4>
                        {review.reviewer_name && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">👤 {review.reviewer_name}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted mt-1">
                        <span>📅 {dateStr}</span>
                      </div>
                    </div>
                    
                    {/* Edit/Delete Buttons */}
                    <div className="flex gap-2 ml-4">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(review)}
                          className="text-primary text-sm hover:underline font-medium px-3 py-1 hover:bg-blue-50 rounded transition"
                          title="Edit review"
                        >
                          ✎ Edit
                        </button>
                      )}
                      {canDelete && (
                        <>
                          {canEdit && canDelete && <span className="text-border">|</span>}
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="text-red-600 text-sm hover:underline font-medium px-3 py-1 hover:bg-red-50 rounded transition"
                            title="Delete review"
                          >
                            🗑 Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="space-y-2 text-sm">
                    {(review.meeting_details || review.highlights) && (
                      <p className="text-dark p-2 bg-light rounded">
                        <span className="font-semibold">📝 Meeting Details:</span> {(review.meeting_details || review.highlights).substring(0, 150)}{(review.meeting_details || review.highlights).length > 150 ? '...' : ''}
                      </p>
                    )}
                    
                    {review.ctas && (
                      <p className="text-dark p-2 bg-orange-50 rounded">
                        <span className="font-semibold text-orange-700">📋 CTAs:</span> {review.ctas.split('\n')[0]}{review.ctas.split('\n').length > 1 ? '...' : ''}
                      </p>
                    )}

                    {review.risks && (
                      <p className="text-dark p-2 bg-red-50 rounded">
                        <span className="font-semibold text-red-700">⚠️ Risks:</span> {review.risks.substring(0, 150)}{review.risks.length > 150 ? '...' : ''}
                      </p>
                    )}

                    {(review.mom || review.mom_notes) && (
                      <p className="text-dark p-2 bg-purple-50 rounded">
                        <span className="font-semibold text-purple-700">💬 MOM:</span> {(review.mom || review.mom_notes).substring(0, 150)}{(review.mom || review.mom_notes).length > 150 ? '...' : ''}
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
            {isFounder ? 'No meeting reviews submitted yet' : 'You haven\'t submitted any meeting reviews yet'}
          </p>
          <p className="text-sm text-muted">
            {isFounder 
              ? 'Team members will submit their reviews here' 
              : 'Start by adding your first meeting review using the form above'
            }
          </p>
        </div>
      )}

      {/* Guidelines */}
      <div className="card p-6 bg-purple-50 border-l-4 border-l-purple-500">
        <h3 className="font-semibold text-dark mb-3">Executive Review Guidelines</h3>
        <ul className="space-y-2 text-sm text-dark">
          <li>
            <span className="font-semibold">MOM (Minutes of Meeting):</span> Document all discussions and decisions made
          </li>
          <li>
            <span className="font-semibold">CTAs (Call-To-Actions):</span> List specific action items with owners and deadlines
          </li>
          <li>
            <span className="font-semibold">Mark completed CTAs:</span> Prefix with ✓ to track progress (e.g., "✓ Submit report")
          </li>
          <li>
            <span className="font-semibold">Risks:</span> Document any blockers or dependencies that need monitoring
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MonthlyExecReview
