const db = require('../../config/db');
const { comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');

const login = async (identifier, password) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ?', [identifier, identifier]);
  const user = rows[0];

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error('Credenciais inválidas');
  }

  const token = generateToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    },
    token
  };
};

const getMe = async (userId) => {
  const [rows] = await db.execute('SELECT id, username, email, role, permissions, financeSubPerms, trechoSubPerms, avatarUrl FROM users WHERE id = ?', [userId]);
  const user = rows[0];

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
};

const updateProfile = async (userId, updateData) => {
  const { username, email, password, avatarUrl } = updateData;
  
  let query = 'UPDATE users SET username = ?, email = ?, avatarUrl = ?';
  let params = [username, email, avatarUrl];

  if (password) {
    const { hashPassword } = require('../../utils/password');
    const hashedPassword = await hashPassword(password);
    query += ', password = ?';
    params.push(hashedPassword);
  }

  query += ' WHERE id = ?';
  params.push(userId);

  await db.execute(query, params);

  return getMe(userId);
};

const getAllUsers = async () => {
  const [rows] = await db.execute('SELECT id, username, email, role, avatarUrl FROM users');
  return rows;
};

module.exports = {
  login,
  getMe,
  updateProfile,
  getAllUsers
};
