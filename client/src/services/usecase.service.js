import api from './api'

export const usecaseService = {
  getUseCases: async () => {
    try {
      const response = await api.get('/usecases')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getUseCaseById: async (id) => {
    try {
      const response = await api.get(`/usecases/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getUseCasesByProject: async (projectId) => {
    try {
      const response = await api.get(`/usecases/project/${projectId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getLiveUseCases: async () => {
    try {
      const response = await api.get('/usecases/live/all')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getMyUseCases: async () => {
    try {
      const response = await api.get('/usecases/my/usecases')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createUseCase: async (usecaseData) => {
    try {
      const response = await api.post('/usecases', usecaseData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateUseCase: async (id, usecaseData) => {
    try {
      const response = await api.put(`/usecases/${id}`, usecaseData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteUseCase: async (id) => {
    try {
      const response = await api.delete(`/usecases/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default usecaseService
