import api from './api'

export const companyService = {
  // Get all companies
  getCompanies: async () => {
    try {
      const response = await api.get('/companies')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get specific company
  getCompanyById: async (id) => {
    try {
      const response = await api.get(`/companies/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get active companies
  getActiveCompanies: async () => {
    try {
      const response = await api.get('/companies/active')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create new company
  createCompany: async (companyData) => {
    try {
      const response = await api.post('/companies', companyData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update company
  updateCompany: async (id, companyData) => {
    try {
      const response = await api.put(`/companies/${id}`, companyData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete company
  deleteCompany: async (id) => {
    try {
      const response = await api.delete(`/companies/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get all team members for a company
  getTeamMembers: async (companyId = 1) => {
    try {
      const response = await api.get('/users')
      // Filter users that are team members (exclude admin)
      const teamMembers = response.data.users?.filter(u => u.role === 'team' || u.role === 'senior_management') || [];
      return { users: teamMembers }
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Assign team member to company
  assignTeamMember: async (companyId, memberId) => {
    try {
      const response = await api.post(`/companies/${companyId}/assign-team`, {
        user_id: memberId,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default companyService
