require('dotenv').config();
const { Bot, session, InlineKeyboard, Keyboard } = require("grammy");
const { I18n } = require("@grammyjs/i18n");
// const { emojiParser } = require("@grammyjs/emoji");

// Create a bot object
const bot = new Bot(process.env.TOKEN); // <-- place your bot token in this string

// i18n 用于做国际化 internationalization
const i18n = new I18n({
    defaultLocale: "en",
    useSession: true, // 是否在会话中存储用户的语言
    directory: "./locales", // 从 locales/ 加载所有翻译文件
});

bot.use(
    session({
      initial: () => {
        return {};
      },
    }),
);

// 注册 i18n 中间件
bot.use(i18n);

// 注册使用 emoji
// bot.use(emojiParser());


bot.command("start", async (ctx) => {
    const keyboardAtStart = new Keyboard() 
                                .text("❓ Help")
                                .text("🌍 Language")
                                .row()
                                .text("🥷 Hero")
                                .text("🎒 Bag")
                                .row()
                                .text("🛒 Shop")
                                .text("👹 Battle")
                                .row()
                                .text("🗒️ Rank")
                                .text("⚙️ Settings")
                                .resized();
    // let inlineKeyboard = new InlineKeyboard()
    //                         .text("Avatar", "status")
    //                         .text("Dungeon", "playgame");
    await ctx.reply(ctx.t("WelcometoHunterDungeon"), {
        reply_markup: keyboardAtStart,
    });
});

bot.command("hunt", async (ctx) => {
    await ctx.reply(ctx.t("Kill"));
    let result = await ctx.api.sendDice(ctx.chat.id);
    console.log("result:", result.dice.value);
});

bot.command("language", async (ctx) => {
    let inlineKeyboard = new InlineKeyboard()
                            .text("English", "useEnglish")
                            .text("中文", "useChinese");
    await ctx.reply(ctx.t("choose language"), {
        reply_markup: inlineKeyboard
    });
});

bot.callbackQuery('status', async (ctx) => {
    await ctx.reply(ctx.t("handsome man"));
});

bot.callbackQuery('playgame', async (ctx) => {
    await ctx.reply(ctx.t("Goblin out"));
});

bot.callbackQuery('useEnglish', async (ctx) => {
    await ctx.i18n.setLocale("en");
});

bot.callbackQuery('useChinese', async (ctx) => {
    await ctx.i18n.setLocale("zh");
});

// Register listeners to handle messages
bot.on("message:text", async (ctx) => {
    await ctx.reply("Echo: " + ctx.t(ctx.message.text))
});

// Start the bot (using long polling)
bot.start();