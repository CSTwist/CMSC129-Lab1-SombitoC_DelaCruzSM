const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let backupDb;

async function connectMongo() {
    if (!backupDb) {
        try {
            await client.connect();
            backupDb = client.db('journal_app_backup'); // Name of your backup database
            console.log("Connected to MongoDB Backup Database");
        } catch (error) {
            console.error("MongoDB Connection Error:", error);
        }
    }
    return backupDb;
}

module.exports = connectMongo;