const { Sequelize } = require("sequelize");

const setupDatabase = async () => {
  const dbName = process.env.POSTGRES_DB_NAME;
  const baseUri = process.env.POSTGRES_DB_URI;

  if (!baseUri) {
    throw new Error("POSTGRES_DB_URI environment variable is not set");
  }

  // Connect to the default 'postgres' database to create our app's database
  const sequelize = new Sequelize(`${baseUri}/postgres`, {
    dialect: "postgres",
    logging: false,
  });

  try {
    // Check if the database exists
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (results.length === 0) {
      // Database doesn't exist, so create it
      await sequelize.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Database ${dbName} created.`);
    }

    // Close the connection to the 'postgres' database
    await sequelize.close();

    // Connect to the newly created or existing database
    const appSequelize = new Sequelize(`${baseUri}/${dbName}`, {
      dialect: "postgres",
      logging: false,
    });

    // Test the connection
    await appSequelize.authenticate();
    console.log("Database connection has been established successfully.");

    return appSequelize;
  } catch (error) {
    console.error("Error setting up database:", error);
    if (error.original && error.original.code === "3D000") {
      console.error(
        "The database does not exist. Make sure it's created before running the application."
      );
    }
    process.exit(1);
  }
};

module.exports = {
  setupDatabase,
};
