import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { errorResponse } from './utils/apiResponse.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Echo Safety Backend API',
    timestamp: new Date().toISOString(),
  });
});

setupSwagger(app);

app.use('/api/v1', routes);

app.use((req, res) => {
  errorResponse(res, 404, `Route ${req.originalUrl} not found on this server.`);
});

app.use(errorHandler);

export default app;

