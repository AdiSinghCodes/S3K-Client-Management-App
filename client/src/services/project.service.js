import api from './api'

export const projectService = {
  getProjects: async () => {
    try {
      const response = await api.get('/projects')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getProjectsByCompany: async (companyId) => {
    try {
      const response = await api.get(`/projects/company/${companyId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default projectService
