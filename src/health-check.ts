import express from 'express';
import http from 'http';

const app = express();
const router = express.Router();

router.use((_, res, next) => {
	res.header('Access-Control-Allow-Methods', 'GET');
	next();
});

router.get('/health', (_, res) => {
	res.status(200).send('Ok');
});

app.use('/api/v1', router);

const server = http.createServer(app);

server.listen(3000);

console.log('Health check is on!');
