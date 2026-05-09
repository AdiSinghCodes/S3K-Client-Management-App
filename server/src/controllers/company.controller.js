import { getAllCompanies, getCompanyById, createCompany, updateCompany, deleteCompany, getActiveCompanies } from '../models/company.model.js';

export async function getCompanies(req, res) {
  try {
    const isFounder = req.user?.role === 'senior_management' || req.user?.role === 'admin';
    const userId = req.user?.id;
    
    let companies = await getAllCompanies();
    
    // If team member, show only their own created companies
    // If senior management, show all companies
    if (!isFounder && userId) {
      console.log('Filtering companies for team member user_id:', userId);
      companies = companies.filter(c => c.user_id === userId);
    }
    
    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getCompanyByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const company = await getCompanyById(id);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createCompanyHandler(req, res) {
  try {
    const { company_name, industry, contract_value, start_date, status = 'active', company_detail } = req.body;

    if (!company_name || !industry) {
      return res.status(400).json({ error: 'Company name and industry required' });
    }

    // Get user_id from authenticated user, pass it to track who created the company
    const userId = req.user?.id || null;
    
    // Convert empty contract_value to NULL or 0
    const finalContractValue = contract_value && contract_value !== '' ? contract_value : null;
    
    console.log('Creating company with user_id:', userId, 'contract_value:', finalContractValue);

    const newCompany = await createCompany(company_name, industry, finalContractValue, start_date, status, userId, company_detail);
    res.status(201).json({ message: 'Company created', company: newCompany });
  } catch (error) {
    console.error('Create company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function updateCompanyHandler(req, res) {
  try {
    const { id } = req.params;
    const { company_name, industry, contract_value, start_date, status } = req.body;

    const company = await getCompanyById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const updatedCompany = await updateCompany(id, company_name, industry, contract_value, start_date, status);
    res.json({ message: 'Company updated', company: updatedCompany });
  } catch (error) {
    console.error('Update company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteCompanyHandler(req, res) {
  try {
    const { id } = req.params;

    const company = await getCompanyById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await deleteCompany(id);
    res.json({ message: 'Company deleted' });
  } catch (error) {
    console.error('Delete company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function assignTeamMember(req, res) {
  try {
    const { companyId, userId } = req.body;

    if (!companyId || !userId) {
      return res.status(400).json({ error: 'Company ID and User ID required' });
    }

    res.status(201).json({ message: 'Team member assigned', data: { company_id: companyId, user_id: userId } });
  } catch (error) {
    console.error('Assign team member error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getActiveCompaniesHandler(req, res) {
  try {
    const companies = await getActiveCompanies();
    res.json({ companies });
  } catch (error) {
    console.error('Get active companies error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
