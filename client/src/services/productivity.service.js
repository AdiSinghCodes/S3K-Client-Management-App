import api from './api'

export const productivityService = {
  getProductivityLogs: async () => {
    try {
      const response = await api.get('/productivity')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getProductivityLogById: async (id) => {
    try {
      const response = await api.get(`/productivity/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getProductivityLogsByUser: async (userId) => {
    try {
      const response = await api.get(`/productivity/user/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getTopPerformers: async () => {
    try {
      const response = await api.get('/productivity/analytics/top')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getAverageProductivity: async (userId) => {
    try {
      const response = await api.get(`/productivity/analytics/avg/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createProductivityLog: async (logData) => {
    try {
      const response = await api.post('/productivity', logData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateProductivityLog: async (id, logData) => {
    try {
      const response = await api.put(`/productivity/${id}`, logData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteProductivityLog: async (id) => {
    try {
      const response = await api.delete(`/productivity/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default productivityService
