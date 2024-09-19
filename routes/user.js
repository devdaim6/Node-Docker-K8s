const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const errorBoundary = require("../utils/ErrorBoundary");
const { setupLogger } = require("../utils/logger");

const logger = setupLogger();

// Get all users
router.get(
  "/",
  errorBoundary(async (req, res) => {
    logger.info("Fetching all users");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        email: true,
        name: true,
      },
      take: 100,
      skip: 0,
    });
    logger.info(`Retrieved ${users.length} users`);
    res.json(users);
  })
);

// Get a single user by ID
router.get(
  "/:id",
  errorBoundary(async (req, res) => {
    const userId = parseInt(req.params.id);
    logger.info(`Fetching user with ID: ${userId}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        createdAt: true,
        email: true,
        name: true,
      },
    });
    if (user) {
      logger.info(`User found: ${user.id}`);
      res.json(user);
    } else {
      logger.warn(`User not found with ID: ${userId}`);
      res.status(404).json({ error: "User not found" });
    }
  })
);

// Create a new user (Register)
router.post(
  "/register",
  errorBoundary(async (req, res) => {
    logger.info("Registering new user");
    const { email, name, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        createdAt: true,
        email: true,
        name: true,
      },
    });
    logger.info(`New user registered: ${newUser.id}`);
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  })
);

// Login route
router.post(
  "/login",
  errorBoundary(async (req, res) => {
    logger.info(`Login attempt for email: ${req.body.email}`);
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
      select: {
        id: true,
        password: true,
        email: true,
        name: true,
      },
    });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      req.session.userId = user.id;
      logger.info(`User logged in successfully: ${user.id}`);
      res.json({ message: "Logged in successfully" });
    } else {
      logger.warn(`Failed login attempt for email: ${req.body.email}`);
      res.status(401).json({ error: "Invalid credentials" });
    }
  })
);

// Logout route
router.post(
  "/logout",
  errorBoundary((req, res) => {
    logger.info(`Logout attempt for user: ${req.session.userId}`);
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Logout error: ${err.message}`);
        res.status(500).json({ error: "Could not log out: " + err.message });
      } else {
        logger.info("User logged out successfully");
        res.json({ message: "Logged out successfully" });
      }
    });
  })
);

// Update a user
router.put(
  "/:id",
  errorBoundary(async (req, res) => {
    const userId = parseInt(req.params.id);
    logger.info(`Updating user with ID: ${userId}`);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: req.body.email,
        name: req.body.name,
      },
      select: {
        id: true,
        createdAt: true,
        email: true,
        name: true,
      },
    });
    logger.info(`User updated successfully: ${updatedUser.id}`);
    res.json(updatedUser);
  })
);

// Delete a user
router.delete(
  "/:id",
  errorBoundary(async (req, res) => {
    const userId = parseInt(req.params.id);
    logger.info(`Deleting user with ID: ${userId}`);
    await prisma.user.delete({
      where: { id: userId },
    });
    logger.info(`User deleted successfully: ${userId}`);
    res.status(204).send();
  })
);

exports.userRoutes = router;
