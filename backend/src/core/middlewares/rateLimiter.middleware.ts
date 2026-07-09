import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Skip rate limiting for local development / testing
const skipLocalhost = (req: Request): boolean => {
  const ip = req.ip || req.socket.remoteAddress;
  return !!ip && (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1');
};

// Lenient rate limiter for general API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  skip: skipLocalhost,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for Authentication routes (login/register)
// Set to 100 requests per 15 minutes per user's request for testing/development
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 authentication requests per window (dev-friendly limit)
  skip: skipLocalhost,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
