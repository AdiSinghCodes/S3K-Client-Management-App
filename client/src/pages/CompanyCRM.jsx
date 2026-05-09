import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import companyService from '../services/company.service'

const CompanyCRM = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'senior_management'
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    contract_value: '',
    start_date: '',
    company_detail: '',
    status: 'Active',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await companyService.getCompanies()
        setCompanies(response.data || response.companies || [])
        setError('')
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError('Failed to fetch companies')
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  // Summary data - FIXED
  const summaryData = useMemo(() => {
    const totalValue = companies.reduce((sum, c) => sum + (parseFloat(c.contract_value) || 0), 0)
    const activeCompanies = companies.filter((c) => c.status === 'Active' || c.status === 'active').length
    const totalCompanies = companies.length

    return {
      totalValue,
      activeCompanies,
      totalCompanies,
      avgContractValue: activeCompanies > 0 ? (totalValue / activeCompanies).toFixed(0) : 0,
    }
  }, [companies])

  // Chart data - FIXED
  const chartData = useMemo(() => {
    return companies
      .filter((c) => parseFloat(c.contract_value) > 0)
      .map((c) => ({
        name: c.company_name || c.name,
        value: parseFloat(c.contract_value) || 0,
      }))
  }, [companies])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.company_name || !formData.contract_value) {
      setErrorMessage('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        // Update existing company
        await companyService.updateCompany(editingId, formData)
        setSuccessMessage('Company updated successfully!')
        setCompanies(companies.map(c => c.id === editingId ? { ...c, ...formData } : c))
        setEditingId(null)
      } else {
        // Add new company
        const response = await companyService.createCompany(formData)
        setSuccessMessage('Company added successfully!')
        setCompanies([...companies, response.data || response.company])
      }

      setFormData({ company_name: '', industry: '', contract_value: '', start_date: '', status: 'Active' })
      setShowAddForm(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error saving company:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to save company')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleEdit = (company) => {
    setEditingId(company.id)
    setFormData({
      company_name: company.company_name || company.name || '',
      industry: company.industry || '',
      contract_value: company.contract_value || '',
      start_date: company.start_date || '',
      status: company.status || 'Active',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return

    try {
      await companyService.deleteCompany(id)
      setSuccessMessage('Company deleted successfully!')
      setCompanies(companies.filter(c => c.id !== id))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting company:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to delete company')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ company_name: '', industry: '', contract_value: '', start_date: '', status: 'Active' })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="card p-8 text-center">
          <p className="text-lg text-muted">Loading companies...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="space-y-8 pt-12 px-6">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-3">My Clients</h1>
            <p className="text-lg text-muted">Your assigned and created client companies</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Client'}
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="card p-4 bg-green-50 border border-green-200 text-green-700">
            ✓ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="card p-4 bg-red-50 border border-red-200 text-red-700">
            ✕ {errorMessage}
          </div>
        )}

        {/* Add Client Form */}
        {showAddForm && (
          <div className="card p-6 bg-blue-50 border border-blue-200">
            <h2 className="text-xl font-bold text-dark mb-4">Add New Client</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!formData.company_name || !formData.industry) {
                  setErrorMessage('Please fill in company name and industry')
                  return
                }
                try {
                  const newCompany = await companyService.createCompany(formData)
                  setCompanies([...companies, newCompany.company || newCompany])
                  setFormData({ company_name: '', industry: '', contract_value: '', start_date: '', company_detail: '', status: 'Active' })
                  setShowAddForm(false)
                  setSuccessMessage('Client added successfully! Your team lead can now see and assign it.')
                  setTimeout(() => setSuccessMessage(''), 3000)
                } catch (err) {
                  setErrorMessage(err.message || 'Failed to add client')
                  setTimeout(() => setErrorMessage(''), 3000)
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Industry *</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="">Select industry</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Software">Software</option>
                    <option value="Telecom">Telecom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Company Detail</label>
                  <textarea
                    name="company_detail"
                    value={formData.company_detail}
                    onChange={handleInputChange}
                    placeholder="Brief description about the company (optional)"
                    className="input"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Add Client
              </button>
            </form>
          </div>
        )}

        {/* My Clients List */}
        {loading ? (
          <div className="card p-8 text-center">
            <p className="text-lg text-muted">Loading your clients...</p>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="card-title mb-6">Your Clients</h2>
            {companies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted mb-4">No clients yet.</p>
                <p className="text-sm text-muted">Click "Add Client" to create your first client profile.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-dark">Company Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark">Industry</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark">Company Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b border-border hover:bg-light transition-colors">
                        <td className="py-4 px-4 text-dark font-medium">{company.company_name || company.name}</td>
                        <td className="py-4 px-4 text-dark">{company.industry || '-'}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`badge ${
                              company.status === 'Active' || company.status === 'active'
                                ? 'badge-success'
                                : company.status === 'Prospect'
                                  ? 'badge-info'
                                  : 'badge-warning'
                            }`}
                          >
                            {company.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-dark text-sm">{company.company_detail || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-12 px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dark mb-3">Company CRM</h1>
        <p className="text-lg text-muted">Client contract management and relationship tracking</p>
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

      {/* Action Button */}
      <div className="card p-4 bg-gradient-to-r from-purple-50 to-pink-50 flex flex-wrap gap-4 items-start">
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add Company
          </button>
        )}
      </div>

      {/* Add/Edit Company Form */}
      {showAddForm && (
        <div className="card p-6 bg-purple-50 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-dark mb-4">{editingId ? 'Edit Company' : 'Add New Company'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Company Name</label>
              <input
                type="text"
                name="company_name"
                placeholder="e.g. TechCorp"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Industry</label>
              <input
                type="text"
                name="industry"
                placeholder="e.g. Finance"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Contract Value ($)</label>
              <input
                type="number"
                name="contract_value"
                placeholder="e.g. 250000"
                value={formData.contract_value}
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
              <label className="block text-sm font-medium text-dark mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Prospect">Prospect</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-end gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update Company' : 'Save Company'}
              </button>
              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-border rounded-lg text-dark hover:bg-light">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-blue-50 border-l-4 border-l-primary">
          <p className="text-muted text-sm mb-1">Total Contract Value</p>
          <p className="text-2xl font-bold text-primary">${(summaryData.totalValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="card p-6 bg-green-50 border-l-4 border-l-green-500">
          <p className="text-muted text-sm mb-1">Active Companies</p>
          <p className="text-2xl font-bold text-green-600">{summaryData.activeCompanies}</p>
        </div>
        <div className="card p-6 bg-orange-50 border-l-4 border-l-orange-500">
          <p className="text-muted text-sm mb-1">Avg Contract Value</p>
          <p className="text-2xl font-bold text-orange-600">${(summaryData.avgContractValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="card p-6 bg-purple-50 border-l-4 border-l-purple-500">
          <p className="text-muted text-sm mb-1">Total Companies</p>
          <p className="text-2xl font-bold text-purple-600">{summaryData.totalCompanies}</p>
        </div>
      </div>

      {/* Companies Table */}
      <div className="card p-6">
        <h2 className="card-title mb-6">Companies Overview</h2>
        {companies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted">No companies found. Add one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-dark">Company Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Industry</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-dark">Contract Value</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-border hover:bg-light transition-colors">
                    <td className="py-4 px-4 text-dark font-medium">{company.company_name || company.name}</td>
                    <td className="py-4 px-4 text-dark">{company.industry || '-'}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`badge ${
                          company.status === 'Active' || company.status === 'active'
                            ? 'badge-success'
                            : company.status === 'Prospect'
                              ? 'badge-info'
                              : 'badge-warning'
                        }`}
                      >
                        {company.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-dark font-bold">${((parseFloat(company.contract_value) || 0) / 1000).toFixed(0)}K</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="text-primary hover:text-primary-dark text-sm font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-border">|</span>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract Value Chart */}
      {chartData.length > 0 && (
        <div className="card p-6">
          <h2 className="card-title mb-6">Contract Value by Company</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Legend />
              <Bar dataKey="value" fill="#8E44AD" name="Contract Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default CompanyCRM
