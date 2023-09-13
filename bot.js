require('dotenv').config();
const { Bot } = require("grammy");

// Create a bot object
const bot = new Bot(process.env.TOKEN); // <-- place your bot token in this string

// Register listeners to handle messages
bot.on("message:text", (ctx) => {
    if (ctx.message.text == "/start") {
        ctx.reply("Welcome to Hunter Dungeon!")
    }
    else if (ctx.message.text == "/hunt") {
        ctx.reply("Kill!")
    }
    else {
        ctx.reply("Echo: " + ctx.message.text)
    }
});

// Start the bot (using long polling)
bot.start();