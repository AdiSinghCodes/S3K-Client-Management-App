import api from './api'

export const costService = {
  getCosts: async () => {
    try {
      const response = await api.get('/costs')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getCostById: async (id) => {
    try {
      const response = await api.get(`/costs/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getCostsByCompany: async (companyId) => {
    try {
      const response = await api.get(`/costs/company/${companyId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getCostsLastNMonths: async (n) => {
    try {
      const response = await api.get(`/costs/history/${n}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getMonthlyTotals: async () => {
    try {
      const response = await api.get('/costs/totals/all')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createCost: async (costData) => {
    try {
      const response = await api.post('/costs', costData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateCost: async (id, costData) => {
    try {
      const response = await api.put(`/costs/${id}`, costData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteCost: async (id) => {
    try {
      const response = await api.delete(`/costs/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default costService
