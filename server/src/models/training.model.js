import pool from '../config/db.js';

// Get all trainings
export async function getAllTrainings() {
  try {
    const result = await pool.query('SELECT * FROM trainings ORDER BY training_date DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all trainings:', error.message);
    throw error;
  }
}

// Get training by ID
export async function getTrainingById(id) {
  try {
    const result = await pool.query('SELECT * FROM trainings WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting training by ID:', error.message);
    throw error;
  }
}

// Get trainings by company
export async function getTrainingsByCompany(companyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM trainings WHERE company_id = $1 ORDER BY training_date DESC',
      [companyId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting trainings by company:', error.message);
    throw error;
  }
}

// Get trainings by user
export async function getTrainingsByUser(userId) {
  try {
    const result = await pool.query(
      'SELECT * FROM trainings WHERE user_id = $1 ORDER BY training_date DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting trainings by user:', error.message);
    throw error;
  }
}

// Create new training
export async function createTraining(companyId, userId, trainingName, trainer, trainingDate, durationHours, participants, topic, status = 'scheduled', notes = null) {
  try {
    const result = await pool.query(
      `INSERT INTO trainings (company_id, user_id, training_name, trainer, training_date, duration_hours, participants, topic, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [companyId, userId, trainingName, trainer, trainingDate, durationHours, participants, topic, status, notes]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating training:', error.message);
    throw error;
  }
}

// Update training
export async function updateTraining(id, updateData) {
  try {
    const { title, trainer, date, duration, participants, topic, notes, status } = updateData;
    
    const result = await pool.query(
      `UPDATE trainings SET 
        training_name = COALESCE($1, training_name),
        trainer = COALESCE($2, trainer),
        training_date = COALESCE($3, training_date),
        duration_hours = COALESCE($4, duration_hours),
        participants = COALESCE($5, participants),
        topic = COALESCE($6, topic),
        notes = COALESCE($7, notes),
        status = COALESCE($8, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [title, trainer, date, duration, participants, topic, notes, status, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating training:', error.message);
    throw error;
  }
}

// Delete training
export async function deleteTraining(id) {
  try {
    const result = await pool.query('DELETE FROM trainings WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting training:', error.message);
    throw error;
  }
}

// Get scheduled trainings
export async function getScheduledTrainings() {
  try {
    const result = await pool.query(
      "SELECT * FROM trainings WHERE status = 'scheduled' ORDER BY training_date DESC"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting scheduled trainings:', error.message);
    throw error;
  }
}

// Get completed trainings
export async function getCompletedTrainings() {
  try {
    const result = await pool.query(
      "SELECT * FROM trainings WHERE status = 'completed' ORDER BY training_date DESC"
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting completed trainings:', error.message);
    throw error;
  }
}
