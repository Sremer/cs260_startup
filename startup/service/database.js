const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const config = require('./config.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('ditty');
const userCollection = db.collection('user');
const scoreCollection = db.collection('score');

function getUser(username) {
    return userCollection.findOne({ username: username })
}

function getUserByToken(token) {
    return userCollection.findOne({ token: token });
}

async function signUpUser(username, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        username: username,
        password: passwordHash,
        token: uuid.v4(),
    }
    await userCollection.insertOne(user);

    return user;
}

function addScore(score) {
    scoreCollection.insertOne(score);
}

function getRecentScores(username) {
    const query = { username: username };
    const options = {
        sort: { _id: -1 },
        limit: 5,
    };
    const cursor = scoreCollection.find(query, options);
    return cursor.toArray();
}

function getScoreByTitle(username, title) {
    const query = { username: username,
                    title: {$regex: title, $options: 'i'} };
    const options = {
        sort: { _id: -1 },
    };
    const cursor = scoreCollection.find(query, options);
    return cursor.toArray();
}

module.exports = { 
    getUser,
    getUserByToken,
    signUpUser,
    addScore, 
    getRecentScores, 
    getScoreByTitle,
 };

