const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno no servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
