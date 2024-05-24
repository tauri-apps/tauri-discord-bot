import express from 'express';
import http from 'http';

const app = express();
const router = express.Router();

router.use(
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        res.header('Access-Control-Allow-Methods', 'GET');
        const status = app.locals.getStatus();
        if (status === 200) {
            next();
        } else {
            res.status(status).send({ error: 'Something failed!' });
        }
    },
);

router.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).send('Ok');
});

app.use('/api/v1', router);

export default function (callback: any) {
    app.locals.getStatus = callback;
    const server = http.createServer(app);
    return server.listen(3000);
}
