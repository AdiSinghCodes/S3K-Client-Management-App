import { getAllProductivityLogs, getProductivityLogById, getProductivityLogsByUser, createProductivityLog, updateProductivityLog, deleteProductivityLog, getTopPerformers, getAverageProductivityForUser } from '../models/productivity.model.js';

export async function getProductivityLogs(req, res) {
  try {
    const logs = await getAllProductivityLogs();
    
    // Transform database field names to frontend field names
    const transformedLogs = logs.map(log => {
      return {
        id: log.id,
        user_id: log.user_id,
        memberId: log.user_id,
        memberName: log.member_name || `Team Member ${log.user_id}`,
        company_id: log.company_id,
        month_year: log.month_year,
        month: new Date(log.month_year).toLocaleString('en-US', { month: 'short' }),
        year: new Date(log.month_year).getFullYear(),
        tasksCompleted: log.tasks_completed || 0,
        tasksTarget: log.tasks_target || 0,
        reportsSubmitted: log.reports_submitted || 0,
        reportsTarget: log.reports_target || 0,
        milestonesClosedCount: log.milestones_achieved || 0,
        usecaseUpdatesCount: log.use_cases_updated || 0,
        productivity_score: log.productivity_score,
        created_at: log.created_at,
        updated_at: log.updated_at,
      };
    });
    
    console.log('Transformed productivity logs:', transformedLogs);
    res.json({ logs: transformedLogs });
  } catch (error) {
    console.error('Get productivity logs error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getProductivityLogByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const log = await getProductivityLogById(id);

    if (!log) {
      return res.status(404).json({ error: 'Productivity log not found' });
    }

    res.json({ log });
  } catch (error) {
    console.error('Get productivity log error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getProductivityLogsByUserHandler(req, res) {
  try {
    const { userId } = req.params;
    const logs = await getProductivityLogsByUser(userId);
    res.json({ logs });
  } catch (error) {
    console.error('Get productivity logs by user error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createProductivityLogHandler(req, res) {
  try {
    const { user_id, company_id, month_year, member_name, tasks_completed, tasks_target, reports_submitted, reports_target, milestones_achieved, use_cases_live } = req.body;

    console.log('Creating productivity log with:', { user_id, company_id, month_year, member_name, tasks_completed, tasks_target, reports_submitted, reports_target, milestones_achieved, use_cases_live });

    if (!company_id || !month_year || !member_name) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Company ID, month_year, and member_name are required',
        received: { company_id, month_year, member_name }
      });
    }

    const newLog = await createProductivityLog(user_id, company_id, month_year, tasks_completed, tasks_target, reports_submitted, reports_target, milestones_achieved, use_cases_live, null, member_name);
    
    // Transform response to include month and year for frontend filtering
    const transformedLog = {
      id: newLog.id,
      user_id: newLog.user_id,
      memberId: newLog.user_id,
      memberName: newLog.member_name || `Team Member ${newLog.user_id}`,
      company_id: newLog.company_id,
      month_year: newLog.month_year,
      month: new Date(newLog.month_year).toLocaleString('en-US', { month: 'short' }),
      year: new Date(newLog.month_year).getFullYear(),
      tasksCompleted: newLog.tasks_completed || 0,
      tasksTarget: newLog.tasks_target || 0,
      reportsSubmitted: newLog.reports_submitted || 0,
      reportsTarget: newLog.reports_target || 0,
      milestonesClosedCount: newLog.milestones_achieved || 0,
      usecaseUpdatesCount: newLog.use_cases_updated || 0,
      productivity_score: newLog.productivity_score,
      created_at: newLog.created_at,
      updated_at: newLog.updated_at,
    };
    console.log('Productivity log created:', transformedLog);
    res.status(201).json({ message: 'Productivity log created', log: transformedLog });
  } catch (error) {
    console.error('Create productivity log error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function updateProductivityLogHandler(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating productivity log with:', { id, updateData });

    const log = await getProductivityLogById(id);
    if (!log) {
      return res.status(404).json({ error: 'Productivity log not found' });
    }

    // Extract individual parameters from updateData
    const updatedLog = await updateProductivityLog(
      id,
      updateData.tasks_completed,
      updateData.tasks_target,
      updateData.reports_submitted,
      updateData.reports_target,
      updateData.milestones_achieved,
      updateData.use_cases_live,
      null // productivity_score will be calculated if needed
    );
    
    // Transform response to include month and year for frontend filtering
    const transformedLog = {
      id: updatedLog.id,
      user_id: updatedLog.user_id,
      memberId: updatedLog.user_id,
      memberName: updatedLog.member_name || `Team Member ${updatedLog.user_id}`,
      company_id: updatedLog.company_id,
      month_year: updatedLog.month_year,
      month: new Date(updatedLog.month_year).toLocaleString('en-US', { month: 'short' }),
      year: new Date(updatedLog.month_year).getFullYear(),
      tasksCompleted: updatedLog.tasks_completed || 0,
      tasksTarget: updatedLog.tasks_target || 0,
      reportsSubmitted: updatedLog.reports_submitted || 0,
      reportsTarget: updatedLog.reports_target || 0,
      milestonesClosedCount: updatedLog.milestones_achieved || 0,
      usecaseUpdatesCount: updatedLog.use_cases_updated || 0,
      productivity_score: updatedLog.productivity_score,
      created_at: updatedLog.created_at,
      updated_at: updatedLog.updated_at,
    };
    res.json({ message: 'Productivity log updated', log: transformedLog });
  } catch (error) {
    console.error('Update productivity log error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function deleteProductivityLogHandler(req, res) {
  try {
    const { id } = req.params;

    const log = await getProductivityLogById(id);
    if (!log) {
      return res.status(404).json({ error: 'Productivity log not found' });
    }

    await deleteProductivityLog(id);
    res.json({ message: 'Productivity log deleted' });
  } catch (error) {
    console.error('Delete productivity log error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getTopPerformersHandler(req, res) {
  try {
    const performers = await getTopPerformers();
    res.json({ performers });
  } catch (error) {
    console.error('Get top performers error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getAverageProductivityForUserHandler(req, res) {
  try {
    const { userId } = req.params;
    const stats = await getAverageProductivityForUser(userId);
    res.json({ stats });
  } catch (error) {
    console.error('Get average productivity error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
