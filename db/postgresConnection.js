const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { logger } = require("../utils/logger"); // Assuming you have a logger utility

// Get the connection string from environment variables
const connectionString = process.env.POSTGRES_DB_URI;

if (!connectionString) {
    logger.error("Postgres connection string is not defined in environment variables.");
    throw new Error("Postgres connection string is required.");
}

// Create a new pool instance
const pool = new Pool({ connectionString });

// Create a Prisma client with the Postgres adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Validate the database connection
pool.connect()
    .then(() => {
        logger.info("Successfully connected to Postgres database.");
    })
    .catch(err => {
        logger.error("Failed to connect to Postgres database:", err);
        throw new Error("Database connection error.");
    });

// Log when the Prisma client is instantiated
logger.info("Prisma client instantiated.");

// Handle pool errors
pool.on("error", (err) => {
    logger.error("Unexpected error on idle client:", err);
});

// Export the Prisma client
exports.prisma = prisma;

