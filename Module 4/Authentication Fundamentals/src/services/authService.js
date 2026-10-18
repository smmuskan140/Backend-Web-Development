const bcrypt = require('bcryptjs');
const prisma = require('../db');

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true
};

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function register({ name, email, password }) {
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password
  ) {
    const error = new Error('Name, email, and password are required');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  const cost = Number.parseInt(process.env.BCRYPT_COST || '12', 10);
  const passwordHash = await bcrypt.hash(password, Number.isInteger(cost) && cost >= 4 && cost <= 31 ? cost : 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash
      },
      select: safeUserSelect
    });
    return user;
  } catch (error) {
    if (error && error.code === 'P2002') {
      const conflict = new Error('An account with this email already exists');
      conflict.status = 409;
      conflict.code = 'EMAIL_ALREADY_EXISTS';
      throw conflict;
    }
    throw error;
  }
}

async function login({ email, password }) {
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) }
  });

  // Use the same generic error for a missing user and a wrong password.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  return publicUser(user);
}

module.exports = { register, login };
