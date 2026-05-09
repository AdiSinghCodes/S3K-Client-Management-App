import { getAllProjects, getProjectById, getProjectsByCompany, createProject, updateProject, deleteProject } from '../models/project.model.js';

export async function getProjects(req, res) {
  try {
    const projects = await getAllProjects();
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getProjectByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getProjectsByCompanyHandler(req, res) {
  try {
    const { companyId } = req.params;
    const projects = await getProjectsByCompany(companyId);
    res.json({ projects });
  } catch (error) {
    console.error('Get projects by company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createProjectHandler(req, res) {
  try {
    const { company_id, project_name, completion_percentage = 0, phase, status = 'active' } = req.body;

    if (!company_id || !project_name) {
      return res.status(400).json({ error: 'Company ID and project name required' });
    }

    const newProject = await createProject(company_id, project_name, completion_percentage, phase, status);
    res.status(201).json({ message: 'Project created', project: newProject });
  } catch (error) {
    console.error('Create project error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateProjectHandler(req, res) {
  try {
    const { id } = req.params;
    const { project_name, completion_percentage, phase, status } = req.body;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await updateProject(id, project_name, completion_percentage, phase, status);
    res.json({ message: 'Project updated', project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteProjectHandler(req, res) {
  try {
    const { id } = req.params;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await deleteProject(id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
