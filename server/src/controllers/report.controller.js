import { getAllReports, getReportById, getReportsByCompany, createReport, updateReport, deleteReport, getDraftReports, getSentReports } from '../models/report.model.js';

export async function getReports(req, res) {
  try {
    const reports = await getAllReports();
    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getReportByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const report = await getReportById(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get report error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getReportsByCompanyHandler(req, res) {
  try {
    const { companyId } = req.params;
    const reports = await getReportsByCompany(companyId);
    res.json({ reports });
  } catch (error) {
    console.error('Get reports by company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createReportHandler(req, res) {
  try {
    const userId = req.user?.id;  // Get user_id from JWT
    const userName = req.user?.name; // Get user name for sent_by field
    const { 
      month, 
      weekNumber, 
      subject,
      body,
      achievements, 
      challenges, 
      blockers, 
      nextWeekPlan,
      clientFeedback, 
      assistance,
      submittedDate,
      status = 'submitted'
    } = req.body;

    console.log('===== CREATING REPORT =====');
    console.log('User from JWT:', { userId, userName });
    console.log('Request body:', { month, weekNumber, subject, body, achievements, challenges, blockers });
    console.log('Status:', status);

    if (!month || !weekNumber) {
      return res.status(400).json({ error: 'Month and week number are required' });
    }

    // Convert month and weekNumber to a date (e.g., "Jun" + 1 = first week of June)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = monthNames.indexOf(month);
    const year = new Date().getFullYear();
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const weekStartDate = new Date(firstDayOfMonth);
    weekStartDate.setDate(firstDayOfMonth.getDate() + (weekNumber - 1) * 7);
    const weekStartDateStr = weekStartDate.toISOString().split('T')[0];  // Format as YYYY-MM-DD

    const newReport = await createReport(
      1,  // Default company_id = 1
      userId,
      weekStartDateStr,
      subject,
      body,
      achievements,
      challenges,
      blockers,
      nextWeekPlan,
      clientFeedback,
      assistance,
      status,
      userName
    );
    
    console.log('Report created successfully:', newReport);
    res.status(201).json({ message: 'Report created', report: newReport });
  } catch (error) {
    console.error('Create report error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export async function updateReportHandler(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updatedReport = await updateReport(id, updateData);
    res.json({ message: 'Report updated', report: updatedReport });
  } catch (error) {
    console.error('Update report error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteReportHandler(req, res) {
  try {
    const { id } = req.params;

    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await deleteReport(id);
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getDraftReportsHandler(req, res) {
  try {
    const reports = await getDraftReports();
    res.json({ reports });
  } catch (error) {
    console.error('Get draft reports error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getSentReportsHandler(req, res) {
  try {
    const reports = await getSentReports();
    res.json({ reports });
  } catch (error) {
    console.error('Get sent reports error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
