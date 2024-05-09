import xService from "../services/x-service.js";

const XApiMiddleware = (req: any, res: any, next: any) => {
    if (xService.isReady()) {
        next();
    } else {
        res.status(503).send({
            status: 503,
            error: 'Service Unavailable',
            message: 'The service is temporarily unavailable. Please try again later.'
        });
    }
};

export default XApiMiddleware;