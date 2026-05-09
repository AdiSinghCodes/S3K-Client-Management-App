import { getAllUseCases, getUseCaseById, getUseCasesByProject, getUseCasesByUser, createUseCase, updateUseCase, deleteUseCase, getLiveUseCases } from '../models/usecase.model.js';

export async function getUseCases(req, res) {
  try {
    const isFounder = req.user?.role === 'senior_management' || req.user?.role === 'admin'
    const userId = req.user?.id

    let useCases = await getAllUseCases()

    // If team member, show only their own created use cases
    // If senior management, show all use cases
    if (!isFounder && userId) {
      console.log('Filtering use cases for team member user_id:', userId)
      useCases = useCases.filter(uc => uc.user_id === userId)
    }

    res.json({ useCases })
  } catch (error) {
    console.error('Get use cases error:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export async function getUseCaseByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const useCase = await getUseCaseById(id);

    if (!useCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }

    res.json({ useCase });
  } catch (error) {
    console.error('Get use case error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getUseCasesByProjectHandler(req, res) {
  try {
    const { projectId } = req.params;
    const useCases = await getUseCasesByProject(projectId);
    res.json({ useCases });
  } catch (error) {
    console.error('Get use cases by project error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getUseCasesByUserHandler(req, res) {
  try {
    const userId = req.user.id;
    const useCases = await getUseCasesByUser(userId);
    res.json({ useCases });
  } catch (error) {
    console.error('Get use cases by user error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createUseCaseHandler(req, res) {
  try {
    const userId = req.user.id;  // Get user_id from JWT token
    const { use_case_name, go_live_date, start_date, expected_end_date, phase_ideation, phase_design, phase_development, phase_uat, phase_live, project_id, assigned_to, progress } = req.body;

    if (!use_case_name || !assigned_to) {
      return res.status(400).json({ error: 'Use case name and assigned team member are required' });
    }

    const newUseCase = await createUseCase(
      project_id || 1,  // Default to project 1 if not provided
      userId,
      use_case_name,
      go_live_date || null,
      start_date || null,
      expected_end_date || null,
      phase_ideation || false,
      phase_design || false,
      phase_development || false,
      phase_uat || false,
      phase_live || false,
      assigned_to,
      progress || 0  // Add progress
    );
    res.status(201).json({ message: 'Use case created', useCase: newUseCase });
  } catch (error) {
    console.error('Create use case error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateUseCaseHandler(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const useCase = await getUseCaseById(id);
    if (!useCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }

    const updatedUseCase = await updateUseCase(id, updateData);
    res.json({ message: 'Use case updated', useCase: updatedUseCase });
  } catch (error) {
    console.error('Update use case error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteUseCaseHandler(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const useCase = await getUseCaseById(id);
    if (!useCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }

    // Check permissions: Team members can only delete their own use cases
    // Senior Management/Admin can delete any use case
    if (userRole === 'team_member' && useCase.assigned_to !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this use case' });
    }

    await deleteUseCase(id);
    res.json({ message: 'Use case deleted' });
  } catch (error) {
    console.error('Delete use case error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getLiveUseCasesHandler(req, res) {
  try {
    const useCases = await getLiveUseCases();
    res.json({ useCases });
  } catch (error) {
    console.error('Get live use cases error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
