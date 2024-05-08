const ErrorMiddleware = (err, req, res, next) => {
    return res.json({
        errorMsg: err.message,
    });
};
export default ErrorMiddleware;
