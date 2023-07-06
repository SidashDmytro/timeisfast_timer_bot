const mongoClient = require('./mongoConnection');

const dbName = 'timeisfast';
const collectionName = 'users';

async function createUser(id) {
    try {
        const user = mongoClient.db(dbName).collection(collectionName);
        const query = { chatId: id, interval: 'daily' };
        const update = { $set: { chatId: id, interval: 'daily' } };
        const options = { upsert: true };

        await user.updateOne(query, update, options); // if chatId exists - update, if didn't exists - create document
        return;
    } catch (error) {
        console.error("Error of creating a user: ", error);
    }
}

async function deleteUser(id) {
    try {
        const user = mongoClient.db(dbName).collection(collectionName);
        await user.deleteOne({ chatId: id });
        return;
    } catch (error) {
        console.error("Error of deleting a user: ", error);
    }
}

async function updateInterval(id, newInterval) {
    try {
        const user = mongoClient.db(dbName).collection(collectionName);
        const query = { chatId: id };
        const update = { $set: { chatId: id, interval: newInterval } };
        await user.updateOne(query, update);
        return;
    } catch (error) {
        console.error("Interval update error: ", error);
    }
}

async function getAllUsers(...userStatuses) {
    try {
        const user = mongoClient.db(dbName).collection(collectionName);

        const users = await user.find({ interval: { $in: userStatuses } }, { projection: { _id: 0, interval: 0 } }).toArray();
        const result = users.map(item => item.chatId);
        return result;
    } catch (error) {
        console.error("Error on getting all users: ", error);
    }
}

module.exports = { createUser, updateInterval, getAllUsers, deleteUser };