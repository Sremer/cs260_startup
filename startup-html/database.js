const { MongoClient } = require('mongodb');
const config = require('./config.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('ditty');
const scoreCollection = db.collection('score');

async function addScore(score) {
    const result = await scoreCollection.insertOne(score);
    return result;
}

module.exports = { addScore };

