const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const session = require("express-session");

const setupMiddleware = (app) => {
  // Logger setup

  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(","),
      credentials: true,
    })
  );

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    })
  );

  app.use(compression());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api", limiter);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );


  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error(
      `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
    res.status(err.status || 500).json({
      message: err.message,
      error: process.env.NODE_ENV === "production" ? {} : err,
    });
  });
};

module.exports = {
  setupMiddleware,
};
