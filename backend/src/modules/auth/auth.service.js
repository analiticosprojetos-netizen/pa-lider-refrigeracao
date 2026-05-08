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
  const [rows] = await db.execute('SELECT id, username, email, role, permissions, financeSubPerms, trechoSubPerms, avatarUrl FROM users');
  return rows.map(user => ({
    ...user,
    permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '{}') : user.permissions,
    financeSubPerms: typeof user.financeSubPerms === 'string' ? JSON.parse(user.financeSubPerms || '{}') : user.financeSubPerms,
    trechoSubPerms: typeof user.trechoSubPerms === 'string' ? JSON.parse(user.trechoSubPerms || '{}') : user.trechoSubPerms
  }));
};

const createUser = async (userData) => {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  const { username, email, password, role, permissions, financeSubPerms, trechoSubPerms, avatarUrl } = userData;
  const { hashPassword } = require('../../utils/password');
  const hashedPassword = await hashPassword(password);

  await db.execute(
    `INSERT INTO users (id, username, email, password, role, permissions, financeSubPerms, trechoSubPerms, avatarUrl) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, username, email, hashedPassword, role || 'ANALISTA', 
      JSON.stringify(permissions || {}), 
      JSON.stringify(financeSubPerms || {}), 
      JSON.stringify(trechoSubPerms || {}),
      avatarUrl || null
    ]
  );

  return getMe(id);
};

const updateUser = async (id, updateData) => {
  const fields = [];
  const params = [];

  const allowedFields = ['username', 'email', 'role', 'permissions', 'financeSubPerms', 'trechoSubPerms', 'avatarUrl'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      fields.push(`${field} = ?`);
      if (['permissions', 'financeSubPerms', 'trechoSubPerms'].includes(field)) {
        params.push(JSON.stringify(updateData[field]));
      } else {
        params.push(updateData[field]);
      }
    }
  }

  if (updateData.password) {
    const { hashPassword } = require('../../utils/password');
    const hashedPassword = await hashPassword(updateData.password);
    fields.push('password = ?');
    params.push(hashedPassword);
  }

  if (fields.length === 0) return getMe(id);

  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  await db.execute(query, params);
  return getMe(id);
};

const deleteUser = async (id) => {
  await db.execute('DELETE FROM users WHERE id = ?', [id]);
  return true;
};

const getRoles = async () => {
  const [rows] = await db.execute('SELECT * FROM roles');
  return rows.map(r => r.name);
};

const createRole = async (name) => {
  await db.execute('INSERT IGNORE INTO roles (name) VALUES (?)', [name]);
  return name;
};

const deleteRole = async (name) => {
  await db.execute('DELETE FROM roles WHERE name = ?', [name]);
  return true;
};

module.exports = {
  login,
  getMe,
  updateProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  deleteRole
};
