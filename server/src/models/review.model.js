import pool from '../config/db.js';

// Get all reviews
export async function getAllReviews() {
  try {
    const result = await pool.query('SELECT * FROM monthly_reviews ORDER BY review_date DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all reviews:', error.message);
    throw error;
  }
}

// Get review by ID
export async function getReviewById(id) {
  try {
    const result = await pool.query('SELECT * FROM monthly_reviews WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting review by ID:', error.message);
    throw error;
  }
}

// Get reviews by company
export async function getReviewsByCompany(companyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM monthly_reviews WHERE company_id = $1 ORDER BY review_date DESC',
      [companyId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting reviews by company:', error.message);
    throw error;
  }
}

// Get reviews by user
export async function getReviewsByUser(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM monthly_reviews WHERE user_id = $1 ORDER BY review_date DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting reviews by user:', error.message);
    throw error;
  }
}

// Create new review
export async function createReview(companyId, userId, reviewDate, meetingDetails, ctas, risks, mom, reviewerName) {
  try {
    const result = await pool.query(
      `INSERT INTO monthly_reviews (company_id, user_id, review_date, highlights, ctas, risks, mom_notes, reviewer_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, userId, reviewDate, meetingDetails, ctas, risks, mom, reviewerName]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating review:', error.message);
    throw error;
  }
}

// Update review
export async function updateReview(id, updateData) {
  try {
    const { company_id, user_id, review_date, meeting_details, ctas, risks, mom, reviewer_name } = updateData;
    
    const result = await pool.query(
      `UPDATE monthly_reviews SET 
        company_id = COALESCE($1, company_id),
        user_id = COALESCE($2, user_id),
        review_date = COALESCE($3, review_date),
        highlights = COALESCE($4, highlights),
        ctas = COALESCE($5, ctas),
        risks = COALESCE($6, risks),
        mom_notes = COALESCE($7, mom_notes),
        reviewer_name = COALESCE($8, reviewer_name),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [company_id, user_id, review_date, meeting_details, ctas, risks, mom, reviewer_name, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating review:', error.message);
    throw error;
  }
}

// Delete review
export async function deleteReview(id) {
  try {
    const result = await pool.query('DELETE FROM monthly_reviews WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting review:', error.message);
    throw error;
  }
}

// Get reviews by month year
export async function getReviewsByMonth(yearMonth) {
  try {
    const result = await pool.query(
      `SELECT * FROM monthly_reviews WHERE TO_CHAR(review_date, 'YYYY-MM') = $1 ORDER BY review_date DESC`,
      [yearMonth]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting reviews by month:', error.message);
    throw error;
  }
}

// Get recent reviews (last 3 months)
export async function getRecentReviews() {
  try {
    const result = await pool.query(
      `SELECT * FROM monthly_reviews WHERE review_date >= CURRENT_DATE - INTERVAL '3 months' ORDER BY review_date DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting recent reviews:', error.message);
    throw error;
  }
}
