require('dotenv').config();
const { Bot, session, InlineKeyboard, Keyboard } = require("grammy");
const { I18n } = require("@grammyjs/i18n");
const { hears } = require("@grammyjs/i18n");

const axios = require("axios");
axios.defaults.baseURL = 'http://127.0.0.1:3030';
axios.defaults.headers.post['Content-Type'] = 'application/json'
// const connectToServerInstance = axios.create();
// import { Knight } from './heroes/knight.js';

// Create a bot object
const bot = new Bot(process.env.TOKEN); // <-- place your bot token in this string



// Store hero [temp]
var hero = null;

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








bot.command("hero", async (ctx) => {
    const keyboardAtHero = new Keyboard() 
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    if (walletAddr == "NULL") {
        await ctx.reply(ctx.t("Warn_atHero_text"), {
            // `reply_to_message_id` 指定实际的回复哪一条信息。
            reply_markup: keyboardAtHero
        });
    }
    else {
        await ctx.reply(ctx.t("Info_atHero_text"), {
            // `reply_to_message_id` 指定实际的回复哪一条信息。
            reply_markup: keyboardAtHero
        });
    }
});







// -------------- /battle ----------------------------------------
// -------------------------------------------------------------
bot.filter(hears("Battle_atStart_button"), async (ctx) => {
    const keyboardAtBattle = new Keyboard() 
                                .text(ctx.t("Explore_atBattle_button"))
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atBattle_text", {level: Level, step: Step}), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtBattle
    });
});








