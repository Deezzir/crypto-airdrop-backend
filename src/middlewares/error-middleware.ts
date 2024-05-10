import * as common from '../common.js';

const ErrorMiddleware = (err: any, req: any, res: any, next: any) => {
    common.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).send({
        status: statusCode,
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred on the server.'
    });
};

export default ErrorMiddleware;
