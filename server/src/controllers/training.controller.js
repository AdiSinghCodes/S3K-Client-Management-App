import { getAllTrainings, getTrainingById, getTrainingsByCompany, createTraining, updateTraining, deleteTraining, getScheduledTrainings, getCompletedTrainings } from '../models/training.model.js';

export async function getTrainings(req, res) {
  try {
    const trainings = await getAllTrainings();
    res.json({ trainings });
  } catch (error) {
    console.error('Get trainings error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getTrainingByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const training = await getTrainingById(id);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    res.json({ training });
  } catch (error) {
    console.error('Get training error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getTrainingsByCompanyHandler(req, res) {
  try {
    const { companyId } = req.params;
    const trainings = await getTrainingsByCompany(companyId);
    res.json({ trainings });
  } catch (error) {
    console.error('Get trainings by company error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createTrainingHandler(req, res) {
  try {
    const userId = req.user?.id;  // Get user_id from JWT
    let { title, trainer, date, duration, participants, topic, status = 'scheduled', notes } = req.body;

    console.log('Training create request:', { title, trainer, date, duration, participants, topic, status, notes, userId });

    if (!title) {
      return res.status(400).json({ error: 'Training title is required' });
    }

    // Convert participants and duration to integers
    participants = participants ? parseInt(participants) : 0;
    duration = duration ? parseInt(duration) : 0;

    // Date from HTML input is already in YYYY-MM-DD format - no conversion needed
    const formattedDate = date;

    console.log('Formatted date:', formattedDate, 'Participants:', participants, 'Duration:', duration);

    const newTraining = await createTraining(
      1,  // Default company_id = 1
      userId,
      title,  // Map title to training_name in model
      trainer,
      formattedDate,  // Use formatted date
      duration,  // Now an integer
      participants,  // Now an integer
      topic,
      status,
      notes
    );
    console.log('Training created successfully:', newTraining);
    res.status(201).json({ message: 'Training created', training: newTraining });
  } catch (error) {
    console.error('Create training error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export async function updateTrainingHandler(req, res) {
  try {
    const { id } = req.params;
    let updateData = req.body;
    console.log('Update request received for training:', id, updateData);

    // Convert participants and duration to integers if present
    if (updateData.participants) {
      updateData.participants = parseInt(updateData.participants);
    }
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }

    // Date from HTML input is already in YYYY-MM-DD format - no conversion needed
    console.log('Update data after type conversion:', updateData);

    const training = await getTrainingById(id);
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const updatedTraining = await updateTraining(id, updateData);
    console.log('Training updated successfully:', updatedTraining);
    res.json({ message: 'Training updated', training: updatedTraining });
  } catch (error) {
    console.error('Update training error:', error.message, error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export async function deleteTrainingHandler(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const training = await getTrainingById(id);
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Check permissions: Team members can only delete their own trainings
    // Senior Management/Admin can delete any training
    if (userRole === 'team_member' && training.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this training' });
    }

    await deleteTraining(id);
    res.json({ message: 'Training deleted' });
  } catch (error) {
    console.error('Delete training error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getScheduledTrainingsHandler(req, res) {
  try {
    const trainings = await getScheduledTrainings();
    res.json({ trainings });
  } catch (error) {
    console.error('Get scheduled trainings error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getCompletedTrainingsHandler(req, res) {
  try {
    const trainings = await getCompletedTrainings();
    res.json({ trainings });
  } catch (error) {
    console.error('Get completed trainings error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
