const express = require("express");
const { setupMiddleware } = require("./utils/setupMiddleware");
const { setupDatabase } = require("./utils/setupDB");
// const { connectToDatabase } = require("./db/mongoConnection");
const dotenv = require("dotenv");
const { userRoutes } = require("./routes/user");
const { setupLogger } = require("./utils/logger");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const logger=setupLogger();

app.use((req, res, next) => {
  req.logger = logger;
  next();
});
// Log each request
// app.use((req, res, next) => {
// 	logger.info(`${req.method} ${req.originalUrl}`, {
// 		ip: req.ip,
// 		userAgent: req.get('User-Agent')
// 	});
// 	next();
// });

//connect to database
// connectToDatabase();
setupDatabase();

// Middleware setup
setupMiddleware(app);

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Node.js Express server!" });
});

app.use("/users", userRoutes);
 
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
