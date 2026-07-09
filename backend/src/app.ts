import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import router from './routes/index';
import { notFound } from './core/middlewares/notFound.middleware';
import { errorHandler } from './core/middlewares/errorHandler.middleware';

const appInstance = express();

// Trust proxy for accurate IP logging when deployed behind a Load Balancer (Render, Railway, etc.)
appInstance.set('trust proxy', 1);

// Security headers and CORS configuration
appInstance.use(helmet());
appInstance.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Request body parsers and cookies
appInstance.use(express.json());
appInstance.use(express.urlencoded({ extended: true }));
appInstance.use(cookieParser());

// Request Logging
appInstance.use(morgan('dev'));

// Master Router Mounting
appInstance.use('/', router);

// Global 404 Route handler
appInstance.use(notFound);

// Global Exception Error Handler
appInstance.use(errorHandler);

export default appInstance;
