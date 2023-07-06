const { createUser, updateInterval, getAllUsers, deleteUser } = require('./mongo/mongoFunctions');

function whatDayToday() {
    let date = new Date();
    return {
        month: date.getMonth() + 1,
        day: date.getDate(),
        dayOfWeek: date.getDay() // 0 for sunday, 1 for monday
    }
}

async function getAllUsersMongoDB(...userStatuses) {
    try {
        let result = await getAllUsers(...userStatuses);
        return result;
    } catch (error) {
        console.error(error);
    }
}
async function createUserMongoDB(id) {
    try {
        await createUser(id)
        return;
    } catch (error) {
        console.error(error);
    }
}

async function deleteUserMongoDB(id) {
    try {
        await deleteUser(id)
        return;
    } catch (error) {
        console.error(error);
    }
}

async function updateIntervalMongoDB(id, newInterval) {
    try {
        await updateInterval(id, newInterval)
        return;
    } catch (error) {
        console.error(error);
    }
}

function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getPercentage(day, year) {
    let daysInYear = (isLeapYear(year)) ? 366 : 365;
    const result = day / daysInYear * 100;
    return +result.toFixed(2);
}

function getDate() {
    let today = new Date();
    let year = today.getFullYear();
    let day = Math.ceil((Date.now() - new Date(year, 0, 1)) / 24 / 60 / 60 / 1000);
    return [day, year];
}

function drawTheScale(percentage) {
    const countOfSquares = 20; // how many squares in the scale
    const filledSquares = Math.floor(percentage / (100 / countOfSquares));
    const blankSquares = countOfSquares - filledSquares;
    let scale = '';
    for (i = 0; i < filledSquares; i++) { scale += '▓'; }
    for (i = 0; i < blankSquares; i++) { scale += '░'; }
    return scale;
}

module.exports = { getPercentage, drawTheScale, getDate, createUserMongoDB, updateIntervalMongoDB, getAllUsersMongoDB, whatDayToday, deleteUserMongoDB };