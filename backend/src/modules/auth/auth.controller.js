const authService = require('./auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
    }

    const data = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    if (error.message === 'Credenciais inválidas') {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const logout = (req, res) => {
  // Para JWT stateless no lado do backend, o logout normalmente é apenas retornar sucesso
  // E o frontend fica encarregado de apagar o token do storage.
  res.status(200).json({
    success: true,
    data: { message: 'Logout realizado com sucesso' }
  });
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getMe(userId);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, password, avatarUrl } = req.body;

    const updatedUser = await authService.updateProfile(userId, {
      username,
      email,
      password,
      avatarUrl
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await authService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await authService.getRoles();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  try {
    const role = await authService.createRole(req.body.name);
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await authService.deleteRole(req.params.name);
    res.status(200).json({ success: true, message: 'Cargo excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  updateProfile,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  deleteRole
};


