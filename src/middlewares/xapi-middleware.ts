import xService from "../services/x-service.js";
import * as common from "../common.js";

const XApiMiddleware = async (req: any, res: any, next: any) => {
    if (await xService.isReady()) {
        next();
    } else {
        common.log('XApiMiddleware: Service not ready');
        res.status(503).send({
            status: 503,
            error: 'Service Unavailable',
            message: 'The service is temporarily unavailable. Please try again later.'
        });
    }
};

export default XApiMiddleware;