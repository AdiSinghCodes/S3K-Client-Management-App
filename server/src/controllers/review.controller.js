import { getAllReviews, getReviewById, getReviewsByCompany, createReview, updateReview, deleteReview, getReviewsByMonth, getRecentReviews } from '../models/review.model.js';

export async function getReviews(req, res) {
  try {
    const reviews = await getAllReviews();
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getReviewByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const review = await getReviewById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getReviewsByCompanyHandler(req, res) {
  try {
    const { companyId } = req.params;
    const reviews = await getReviewsByCompany(companyId);
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews by company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createReviewHandler(req, res) {
  try {
    const { company_id, user_id, review_date, meeting_details, ctas, risks, mom, reviewer_name } = req.body;

    // Validate required fields
    if (!company_id || !review_date) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'company_id and review_date are required' 
      });
    }

    console.log('Creating review with:', { company_id, user_id, review_date, meeting_details, ctas, risks, mom, reviewer_name });

    const newReview = await createReview(company_id, user_id, review_date, meeting_details, ctas, risks, mom, reviewer_name);
    res.status(201).json({ message: 'Review created', review: newReview });
  } catch (error) {
    console.error('Create review error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

export async function updateReviewHandler(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const review = await getReviewById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = await updateReview(id, updateData);
    res.json({ message: 'Review updated', review: updatedReview });
  } catch (error) {
    console.error('Update review error:', error.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

export async function deleteReviewHandler(req, res) {
  try {
    const { id } = req.params;

    const review = await getReviewById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await deleteReview(id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getReviewsByMonthHandler(req, res) {
  try {
    const { month } = req.params;
    const reviews = await getReviewsByMonth(month);
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews by month error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getRecentReviewsHandler(req, res) {
  try {
    const reviews = await getRecentReviews();
    res.json({ reviews });
  } catch (error) {
    console.error('Get recent reviews error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
