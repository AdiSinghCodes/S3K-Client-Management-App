import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../models/user.model.js';
import { hashPassword } from '../utils/bcrypt.js';

export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getUserByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createUserHandler(req, res) {
  try {
    const { name, email, password, role = 'team' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await createUser(name, email, hashedPassword, role);

    res.status(201).json({ 
      message: 'User created',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('Create user error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateUserHandler(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await updateUser(id, name, email, role);
    res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteUserHandler(req, res) {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await deleteUser(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
