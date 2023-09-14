require('dotenv').config();
const { Bot, session, InlineKeyboard, Keyboard } = require("grammy");
const { I18n } = require("@grammyjs/i18n");
const { hears } = require("@grammyjs/i18n");
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
                                .text(ctx.t("Help_atStart_button"))
                                .text(ctx.t("Language_atStart_button"))
                                .row()
                                .text(ctx.t("Hero_atStart_button"))
                                .text(ctx.t("Bag_atStart_button"))
                                .row()
                                .text(ctx.t("Shop_atStart_button"))
                                .text(ctx.t("Battle_atStart_button"))
                                .row()
                                .text(ctx.t("Rank_atStart_button"))
                                .text(ctx.t("Settings_atStart_button"))
                                .resized();
    await ctx.reply(ctx.t("welcome"), {
        reply_markup: keyboardAtStart,
    });
});

bot.filter(hears("Help_atStart_button"), async (ctx) => {
    const keyboardAtHelp = new Keyboard() 
                                .text(ctx.t("Story_atHelp_button"))
                                .text(ctx.t("Reward_atHelp_button"))
                                .row()
                                .text(ctx.t("Back_atHelp_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atHelp_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtHelp
    });
});

bot.filter(hears("Story_atHelp_button"), async (ctx) => {
    
    await ctx.reply(ctx.t("Story_atHelp_text"));
});

bot.filter(hears("Reward_atHelp_button"), async (ctx) => {
    
    await ctx.reply(ctx.t("Reward_atHelp_text"));
});

bot.filter(hears("Back_atHelp_button"), async (ctx) => {
    const keyboardAtStart = new Keyboard() 
                                .text(ctx.t("Help_atStart_button"))
                                .text(ctx.t("Language_atStart_button"))
                                .row()
                                .text(ctx.t("Hero_atStart_button"))
                                .text(ctx.t("Bag_atStart_button"))
                                .row()
                                .text(ctx.t("Shop_atStart_button"))
                                .text(ctx.t("Battle_atStart_button"))
                                .row()
                                .text(ctx.t("Rank_atStart_button"))
                                .text(ctx.t("Settings_atStart_button"))
                                .resized();
    await ctx.reply(ctx.t("welcome"), {
        // `reply_to_message_id` 指定实际的回复哪一条信息。
        reply_markup: keyboardAtStart
    });
});

bot.filter(hears("Language_atStart_button"), async (ctx) => {
    const keyboardAtLang = new Keyboard()
                            .text(ctx.t("English_atLang_button"))
                            .text(ctx.t("Chinese_atLang_button"))
                            .row()
                            .text(ctx.t("Back_atLang_button"))
                            .resized();

    await ctx.reply(ctx.t("Info_atLang_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtLang
    });
});

bot.filter(hears("English_atLang_button"), async (ctx) => {
    await ctx.i18n.setLocale("en");

    const keyboardAtLangSub = new Keyboard() 
                                .text(ctx.t("Back_atLangSub_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atLangSub_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtLangSub
    });
});

bot.filter(hears("Chinese_atLang_button"), async (ctx) => {
    await ctx.i18n.setLocale("zh");

    const keyboardAtLangSub = new Keyboard() 
                                .text(ctx.t("Back_atLangSub_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atLangSub_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtLangSub
    });
});

bot.filter(hears("Back_atLangSub_button"), async (ctx) => {
    const keyboardAtStart = new Keyboard() 
                                .text(ctx.t("Help_atStart_button"))
                                .text(ctx.t("Language_atStart_button"))
                                .row()
                                .text(ctx.t("Hero_atStart_button"))
                                .text(ctx.t("Bag_atStart_button"))
                                .row()
                                .text(ctx.t("Shop_atStart_button"))
                                .text(ctx.t("Battle_atStart_button"))
                                .row()
                                .text(ctx.t("Rank_atStart_button"))
                                .text(ctx.t("Settings_atStart_button"))
                                .resized();
    await ctx.reply(ctx.t("welcome"), {
        // `reply_to_message_id` 指定实际的回复哪一条信息。
        reply_markup: keyboardAtStart
    });
});

bot.on("callback_query:data", async (ctx) => {
    console.log("Unknown button event with payload", ctx.callbackQuery.data);
    await ctx.answerCallbackQuery(); // 移除加载动画
});

// Register listeners to handle messages
bot.on("message:text", async (ctx) => {
    await ctx.reply("Echo: " + ctx.t(ctx.message.text))
});

// Start the bot (using long polling)
bot.start();