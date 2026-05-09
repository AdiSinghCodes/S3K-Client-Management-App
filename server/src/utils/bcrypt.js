import bcrypt from 'bcrypt';

// Hash password
export async function hashPassword(plainPassword) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error.message);
    throw error;
  }
}

// Compare plain password with hashed password
export async function comparePassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error.message);
    throw error;
  }
}

// Generate random password
export function generateRandomPassword(length = 12) {
  try {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  } catch (error) {
    console.error('Error generating random password:', error.message);
    throw error;
  }
}
