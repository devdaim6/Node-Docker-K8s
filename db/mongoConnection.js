// const { MongoClient } = require("mongodb");

// const uri = process.env.MONGODB_URI;
// const dbName = process.env.MONGODB_DB_NAME;

// const client = new MongoClient(uri, {
//   maxPoolSize: 10,
// });

// let db;

// async function connectToDatabase() {
//   if (!db) {
//     await client.connect();
//     db = client.db(dbName);
//     console.log("Connected to MongoDB");
//   }
//   return db;
// }

// module.exports = {
//   connectToDatabase,
//   getDb: () => db,
// };
