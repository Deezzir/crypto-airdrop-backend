const ErrorMiddleware = (err, req, res, next) => {
  console.log(err.message);
  return res.json({
    errorMsg: err.message,
  });
};

export default ErrorMiddleware;
