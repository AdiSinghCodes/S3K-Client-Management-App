import { getAllCosts, getCostById, getCostsByCompany, createCost, updateCost, deleteCost, getCostsLastNMonths, getMonthlyTotals } from '../models/cost.model.js';

export async function getCosts(req, res) {
  try {
    const costs = await getAllCosts();
    
    // Transform database field names to frontend field names
    const transformedCosts = costs.map(cost => ({
      id: cost.id,
      company_id: cost.company_id,
      month_year: cost.month_year,
      month: new Date(cost.month_year).toLocaleString('en-US', { month: 'short' }),
      year: new Date(cost.month_year).getFullYear(),
      revenue: cost.revenue,
      travel: parseFloat(cost.travel_cost) || 0,
      license: parseFloat(cost.license_cost) || 0,
      freelancer: parseFloat(cost.freelancer_cost) || 0,
      fte: parseFloat(cost.fte_cost) || 0,
      partTimeIndia: parseFloat(cost.part_time_india_cost) || 0,
      partTimeUS: parseFloat(cost.part_time_us_cost) || 0,
      total_cost: cost.total_cost,
      gross_margin: cost.gross_margin,
      gm_percentage: cost.gm_percentage,
      created_at: cost.created_at,
      updated_at: cost.updated_at,
    }));
    
    console.log('Transformed costs:', transformedCosts);
    res.json({ costs: transformedCosts });
  } catch (error) {
    console.error('Get costs error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getCostByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const cost = await getCostById(id);

    if (!cost) {
      return res.status(404).json({ error: 'Cost record not found' });
    }

    res.json({ cost });
  } catch (error) {
    console.error('Get cost error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getCostsByCompanyHandler(req, res) {
  try {
    const { companyId } = req.params;
    const costs = await getCostsByCompany(companyId);
    res.json({ costs });
  } catch (error) {
    console.error('Get costs by company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createCostHandler(req, res) {
  try {
    const { company_id, month, year, revenue, travel, license, freelancer, fte, partTimeIndia, partTimeUS } = req.body;

    console.log('Creating cost with:', { company_id, month, year, revenue, travel, license, freelancer, fte, partTimeIndia, partTimeUS });

    // Validate required fields
    if (!company_id || !month || !year) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Company ID, month, and year are required',
        received: { company_id, month, year }
      });
    }

    // Convert month and year to month_year DATE format (use first day of month)
    const monthMap = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
    const monthNum = monthMap[month] || '01';
    const month_year = `${year}-${monthNum}-01`;

    console.log('month_year:', month_year);

    const newCost = await createCost(
      company_id,
      month_year,
      parseFloat(revenue) || 0,
      parseFloat(travel) || 0,
      parseFloat(license) || 0,
      parseFloat(freelancer) || 0,
      parseFloat(fte) || 0,
      parseFloat(partTimeIndia) || 0,
      parseFloat(partTimeUS) || 0
    );
    
    console.log('Cost created:', newCost);
    res.status(201).json({ message: 'Cost record created', cost: newCost });
  } catch (error) {
    console.error('Create cost error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
}

export async function updateCostHandler(req, res) {
  try {
    const { id } = req.params;
    const { revenue, travel, license, freelancer, fte, partTimeIndia, partTimeUS } = req.body;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid cost ID' });
    }

    const cost = await getCostById(id);
    if (!cost) {
      return res.status(404).json({ error: 'Cost record not found' });
    }

    const updatedCost = await updateCost(
      id,
      parseFloat(revenue) || 0,
      parseFloat(travel) || 0,
      parseFloat(license) || 0,
      parseFloat(freelancer) || 0,
      parseFloat(fte) || 0,
      parseFloat(partTimeIndia) || 0,
      parseFloat(partTimeUS) || 0
    );
    
    if (!updatedCost) {
      return res.status(500).json({ error: 'Failed to update cost record' });
    }
    
    res.json({ message: 'Cost record updated', cost: updatedCost });
  } catch (error) {
    console.error('Update cost error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function deleteCostHandler(req, res) {
  try {
    const { id } = req.params;

    console.log('Deleting cost with ID:', id);

    const cost = await getCostById(id);
    if (!cost) {
      console.warn('Cost record not found:', id);
      return res.status(404).json({ error: 'Cost record not found' });
    }

    const result = await deleteCost(id);
    console.log('Cost deleted successfully:', result);
    res.json({ message: 'Cost record deleted', cost: result });
  } catch (error) {
    console.error('Delete cost error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
}

export async function getCostsLastNMonthsHandler(req, res) {
  try {
    const { n } = req.params;
    const costs = await getCostsLastNMonths(parseInt(n));
    res.json({ costs });
  } catch (error) {
    console.error('Get costs last N months error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getMonthlyTotalsHandler(req, res) {
  try {
    const totals = await getMonthlyTotals();
    res.json({ totals });
  } catch (error) {
    console.error('Get monthly totals error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
