import api from './api'

export const reportService = {
  getReports: async () => {
    try {
      const response = await api.get('/reports')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getReportById: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getReportsByCompany: async (companyId) => {
    try {
      const response = await api.get(`/reports/company/${companyId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getDraftReports: async () => {
    try {
      const response = await api.get('/reports/status/draft')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getSentReports: async () => {
    try {
      const response = await api.get('/reports/status/sent')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createReport: async (reportData) => {
    try {
      const response = await api.post('/reports', reportData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateReport: async (id, reportData) => {
    try {
      const response = await api.put(`/reports/${id}`, reportData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteReport: async (id) => {
    try {
      const response = await api.delete(`/reports/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default reportService
