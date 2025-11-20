const notFound = (req, res, next) => {
  const err = new Error('Route Not Found');
  err.status = 404;
  next(err);
}

const genericErrorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
};

module.exports = { notFound, genericErrorHandler };