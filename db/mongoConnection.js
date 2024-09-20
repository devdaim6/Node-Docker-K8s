require('dotenv').config();
const { MongoClient } = require('mongodb');

async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        // Perform operations here...
    } catch (error) {
        console.error('MongoDB connection error:', error);
    } finally {
        await client.close();
    }
}

exports.connectToDatabase=connectToDatabase;
