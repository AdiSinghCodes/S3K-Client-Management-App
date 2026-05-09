import api from './api'

export const trainingService = {
  getTrainings: async () => {
    try {
      const response = await api.get('/trainings')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getTrainingById: async (id) => {
    try {
      const response = await api.get(`/trainings/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getTrainingsByCompany: async (companyId) => {
    try {
      const response = await api.get(`/trainings/company/${companyId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getScheduledTrainings: async () => {
    try {
      const response = await api.get('/trainings/status/scheduled')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getCompletedTrainings: async () => {
    try {
      const response = await api.get('/trainings/status/completed')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createTraining: async (trainingData) => {
    try {
      const response = await api.post('/trainings', trainingData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateTraining: async (id, trainingData) => {
    try {
      const response = await api.put(`/trainings/${id}`, trainingData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteTraining: async (id) => {
    try {
      const response = await api.delete(`/trainings/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default trainingService
