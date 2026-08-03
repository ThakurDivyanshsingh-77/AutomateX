import jwt from 'jsonwebtoken';

export const generateToken = (id, role = 'user') => {
  const secret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id, role }, secret, { expiresIn });
};
