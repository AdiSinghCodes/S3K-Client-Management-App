import api from './api'

export const reviewService = {
  getReviews: async () => {
    try {
      const response = await api.get('/reviews')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getReviewById: async (id) => {
    try {
      const response = await api.get(`/reviews/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getReviewsByCompany: async (companyId) => {
    try {
      const response = await api.get(`/reviews/company/${companyId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getReviewsByMonth: async (month) => {
    try {
      const response = await api.get(`/reviews/month/${month}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getRecentReviews: async () => {
    try {
      const response = await api.get('/reviews/recent/all')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateReview: async (id, reviewData) => {
    try {
      const response = await api.put(`/reviews/${id}`, reviewData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteReview: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default reviewService
