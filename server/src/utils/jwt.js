import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
export function generateToken(userId, userRole, userName) {
  try {
    const token = jwt.sign(
      { id: userId, role: userRole, name: userName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw error;
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return null;
  }
}

// Decode token without verification (to read payload)
export function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
