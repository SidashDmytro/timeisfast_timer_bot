require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.DB_URL);

async function connect() {
    try {
        await client.connect();
        console.log("Connected to the database");
    } catch (err) {
        console.error(err);
    }
}

connect();

module.exports = client;