require('dotenv').config();
const { Bot, InlineKeyboard } = require("grammy");

// Create a bot object
const bot = new Bot(process.env.TOKEN); // <-- place your bot token in this string

bot.command("start", (ctx) => {
    const inlineKeyboard = new InlineKeyboard()
                            .text("Avatar", "status")
                            .text("Dungeon", "playgame");
    ctx.reply("Welcome to Hunter Dungeon!", {
        reply_markup: inlineKeyboard,
    });
});

bot.command("hunt", async (ctx) => {
    ctx.reply("Kill!")
    let result = await ctx.api.sendDice(ctx.chat.id);
    console.log("result:", result.dice.value);
});

bot.callbackQuery('status', (ctx) => {
    ctx.reply("handsome man");
});

bot.callbackQuery('playgame', (ctx) => {
    ctx.reply("Goblin out");
});

// Register listeners to handle messages
bot.on("message:text", (ctx) => {
     ctx.reply("Echo: " + ctx.message.text)
});

// Start the bot (using long polling)
bot.start();