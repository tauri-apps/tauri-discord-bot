import express from "express";
import http from "http";

const app = express();
const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

router.get('/health', (req, res) => {
  res.status(200).send('Ok');
});

app.use('/api/v1', router);

const server = http.createServer(app);

export default server.listen(3000);