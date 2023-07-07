require('dotenv').config();
const { getPercentage, drawTheScale, getDate, createUserMongoDB, updateIntervalMongoDB, getAllUsersMongoDB, whatDayToday, deleteUserMongoDB } = require('./functions')
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const COMMANDS = require('./commands');
const CronJob = require('cron').CronJob;

const bot = new TelegramBot(token, { polling: true });

// Commands for bot
bot.setMyCommands(COMMANDS)
    .catch(error => console.error(error));

let currentDay = getDate()[0];
let currentYear = getDate()[1];
let percentage = getPercentage(currentDay, currentYear)
const progressMsg = `Вже пройшло ${percentage}% у ${currentYear} році\n${drawTheScale(percentage)}`;

bot.on('polling_error', (error) => {
    console.error('[polling_error]', error);
});

const intervalKeyboard = {
    reply_markup: {
        keyboard: [
            [{ text: 'Щоденно' }, { text: 'Раз на тиждень' }, { text: 'Раз у місяць' }],
            [{ text: 'Повернутись у головне меню ↩️' }]
        ],
        resize_keyboard: true,
    }
};

const keyboard = {
    reply_markup: {
        keyboard: [
            [{ text: '🔍 Показати прогрес' }, { text: '🗓️ Змінити інтервал повідомлень' }]
        ],
        resize_keyboard: true,
    }
};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text.toString();

    switch (message) {
        case '/start':
            await createUserMongoDB(chatId);
            bot.sendMessage(chatId, `Вітаю! 👋 Я бот, який вимірює кількість пройдених днів року у відсотках. Я дам вам знати, наскільки ми близько до кінця року. Це ваша можливість відчути час ⌛ і цінувати кожен момент! 🚀\n\nВи будете отримувати повідомлення кожного дня. Щоб змінити інтервал повідомлень, скористайтеся кнопками нижче 👇\n\n${progressMsg}`, keyboard);
            break;
        case '/stop':
            await deleteUserMongoDB(chatId);
            bot.sendMessage(chatId, `Я більше не буду відправляти вам повідомлення.\nЯкщо ви знову захочете запустити бота, просто відправте команду /start`, keyboard);
            break;
        case '🗓️ Змінити інтервал повідомлень':
            bot.sendMessage(chatId, 'Оберіть інтервал ⏳ повідомлень:', intervalKeyboard);
            break;
        case 'Щоденно':
            await updateIntervalMongoDB(chatId, 'daily');
            bot.sendMessage(chatId, 'Ви будете отримувати повідомлення кожного дня ✅', keyboard);
            break;
        case 'Раз на тиждень':
            await updateIntervalMongoDB(chatId, 'weekly');
            bot.sendMessage(chatId, 'Ви будете отримувати повідомлення кожного понеділка ✅', keyboard);
            break;
        case 'Раз у місяць':
            await updateIntervalMongoDB(chatId, 'monthly');
            bot.sendMessage(chatId, 'Ви будете отримувати повідомлення 1 числа кожного місяця ✅', keyboard);
            break;
        case '🔍 Показати прогрес':
            bot.sendMessage(chatId, progressMsg, keyboard);
            break;
        case 'Повернутись у головне меню ↩️':
        default:
            bot.sendMessage(chatId, 'Для роботи з ботом, скористайтеся кнопками нижче 👇', keyboard);
            break;
    }
})

let job = new CronJob(
    '0 9 * * *', async () => {
        let today = whatDayToday();
        let usersList = [];
        let textOfMessage = '';
        if (today.month == 1 && today.day == 1) { //January, 1 - send a message to all users and wish them a Happy New Year
            usersList = await getAllUsersMongoDB('weekly', 'daily', 'monthly');
            textOfMessage = `Вітаємо вас із Новим Роком!!! 🥳🎉🎊`
        } else if (today.day == 1) {// 1st day of every month - send a message to all users
            usersList = await getAllUsersMongoDB('weekly', 'daily', 'monthly');
            textOfMessage = `Настав новий місяць 🗓️. ${progressMsg}`
        } else if (today.dayOfWeek == 1) { // Monday - send a message to users who subscribed on weekly and daily newsletter
            usersList = await getAllUsersMongoDB('weekly', 'daily');
            textOfMessage = `Настав новий тиждень. ${progressMsg}`
        } else { // send a message to users who subscribed on daily newsletter
            usersList = await getAllUsersMongoDB('daily');
            textOfMessage = `Настав новий день. ${progressMsg}`
        }

        usersList.forEach((item) => {
            try {
                bot.sendMessage(item, textOfMessage, keyboard);
            } catch (error) {
                console.error(`Error sending message to user ${item}: `, error);
            }
        })

    },
    null,
    false
);

job.start();
