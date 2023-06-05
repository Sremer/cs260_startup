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

function getRecentScores(username) {
    const query = { username: { $regex: username, $options: 'i'} };
    const options = {
        sort: { _id: -1 },
        limit: 5,
    };
    const cursor = scoreCollection.find(query, options);
    return cursor.toArray();
}

function getScoreByTitle(username, title) {
    const query = { username: {$regex: username, $options: 'i'},
                    title: {$regex: title, $options: 'i'} };
    const options = {
        sort: { _id: -1 },
    };
    const cursor = scoreCollection.find(query, options);
    return cursor.toArray();
}

module.exports = { addScore, getRecentScores, getScoreByTitle };

