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

// Store wallet addr [temp]
var walletAddr = "NULL";

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


// -------------- /start ----------------------------------------
// --------------------------------------------------------------
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
                                .text(ctx.t("Wallet_atStart_button"))
                                .resized();
    await ctx.reply(ctx.t("welcome"), {
        reply_markup: keyboardAtStart,
    });
    // console.log("before put data into mysql");
    // await axios.post('/api/user', { _username: "@123", _time: "2023-01-01" });
    // console.log("successfully put data into mysql");
});



// -------------- /home ----------------------------------------
// --------------------------------------------------------------
bot.filter(hears("Back_Home_button"), async (ctx) => {
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
                                .text(ctx.t("Wallet_atStart_button"))
                                .resized();
    await ctx.reply(ctx.t("welcome"), {
        // `reply_to_message_id` 指定实际的回复哪一条信息。
        reply_markup: keyboardAtStart
    });
});
bot.command("home", async (ctx) => {
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
                                .text(ctx.t("Wallet_atStart_button"))
                                .resized();
    await ctx.reply(ctx.t("welcome"), {
        // `reply_to_message_id` 指定实际的回复哪一条信息。
        reply_markup: keyboardAtStart
    });
});



// -------------- /help ----------------------------------------
// -------------------------------------------------------------
bot.filter(hears("Help_atStart_button"), async (ctx) => {
    const keyboardAtHelp = new Keyboard() 
                                .text(ctx.t("Story_atHelp_button"))
                                .text(ctx.t("Reward_atHelp_button"))
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atHelp_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtHelp
    });
});
bot.command("help", async (ctx) => {
    const keyboardAtHelp = new Keyboard() 
                                .text(ctx.t("Story_atHelp_button"))
                                .text(ctx.t("Reward_atHelp_button"))
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atHelp_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtHelp
    });
});
// ++++++++++++++++ Story ++++++++++++++++++++++++
bot.filter(hears("Story_atHelp_button"), async (ctx) => {
    
    await ctx.reply(ctx.t("Story_atHelp_text"));
});
// ++++++++++++++++ Reward ++++++++++++++++++++++++
bot.filter(hears("Reward_atHelp_button"), async (ctx) => {
    
    await ctx.reply(ctx.t("Reward_atHelp_text"));
});



// -------------- /language ----------------------------------------
// -------------------------------------------------------------
bot.filter(hears("Language_atStart_button"), async (ctx) => {
    const keyboardAtLang = new Keyboard()
                            .text(ctx.t("English_atLang_button"))
                            .text(ctx.t("Chinese_atLang_button"))
                            .row()
                            .text(ctx.t("Back_Home_button"))
                            .resized();

    await ctx.reply(ctx.t("Info_atLang_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtLang
    });
});
bot.command("language", async (ctx) => {
    const keyboardAtLang = new Keyboard()
                            .text(ctx.t("English_atLang_button"))
                            .text(ctx.t("Chinese_atLang_button"))
                            .row()
                            .text(ctx.t("Back_Home_button"))
                            .resized();

    await ctx.reply(ctx.t("Info_atLang_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtLang
    });
});
// ++++++++++++++++ English ++++++++++++++++++++++++
bot.filter(hears("English_atLang_button"), async (ctx) => {
    await ctx.i18n.setLocale("en");

    const keyboardAtLangSub = new Keyboard() 
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atLangSub_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtLangSub
    });
});
// ++++++++++++++++ Chinese ++++++++++++++++++++++++
bot.filter(hears("Chinese_atLang_button"), async (ctx) => {
    await ctx.i18n.setLocale("zh");

    const keyboardAtLangSub = new Keyboard() 
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atLangSub_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtLangSub
    });
});



// -------------- /hero ----------------------------------------
// -------------------------------------------------------------
bot.filter(hears("Hero_atStart_button"), async (ctx) => {
    
    const keyboardAtHero_0 = new Keyboard() 
                                .text(ctx.t("Back_Home_button"))
                                .resized();
    const keyboardAtHero_1 = new Keyboard() 
                                .text(ctx.t("Create_atHero_button"))
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    if (hero == null) {
        await ctx.reply(ctx.t("Warn_atHero_text"), {
            // `reply_to_message_id` 指定实际的回复哪一条信息。
            reply_markup: keyboardAtHero_1
        });
    }
    else {
        await ctx.reply(ctx.t("Info_atHero_text"), {
            // `reply_to_message_id` 指定实际的回复哪一条信息。
            reply_markup: keyboardAtHero_0
        });
    }
});
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
// ++++++++++++++++ Create ++++++++++++++++++++++++
bot.filter(hears("Create_atHero_button"), async (ctx) => {
    const keyboardAtHeroCreate = new Keyboard() 
                                .text(ctx.t("Knight_atHeroCreate_button"))
                                .text(ctx.t("Elf_atHeroCreate_button"))
                                .row()
                                .text(ctx.t("Wizard_atHeroCreate_button"))
                                .text(ctx.t("Alchemist_atHeroCreate_button"))
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atHeroCreate_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtHeroCreate
    });
});


// -------------- /bag ----------------------------------------
// -------------------------------------------------------------
bot.filter(hears("Bag_atStart_button"), async (ctx) => {
    const keyboardAtBag = new Keyboard() 
                                .text(ctx.t("Story_atHelp_button"))
                                .text(ctx.t("Reward_atHelp_button"))
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atHero_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtBag
    });
});
bot.command("bag", async (ctx) => {
    const keyboardAtBag = new Keyboard() 
                                .text(ctx.t("Story_atHelp_button"))
                                .text(ctx.t("Reward_atHelp_button"))
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atHero_text"), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtBag
    });
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



// -------------- /rank ----------------------------------------
// -------------------------------------------------------------
bot.filter(hears("Rank_atStart_button"), async (ctx) => {
    const keyboardAtRank = new Keyboard() 
                                .text(ctx.t("Back_Home_button"))
                                .resized();
    let players = [
        {
            name: "a",
            point: "100"
        },
        {
            name: "b",
            point: "90"
        },
        {
            name: "c",
            point: "80"
        }
    ];
    let rank_string = "";
    
    for(let i = 0; i < players.length; i++) {
        rank_string += ctx.t("Info_atRank_text", { rank: i, name: players[i].name, point: players[i].point});
        rank_string += "\n";
    }

    await ctx.reply(rank_string, {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtRank
    });
});
bot.command("rank", async (ctx) => {
    const keyboardAtRank = new Keyboard() 
                                .text(ctx.t("Back_Home_button"))
                                .resized();
    let players = [
        {
            name: "a",
            point: "100"
        },
        {
            name: "b",
            point: "90"
        },
        {
            name: "c",
            point: "80"
        }
    ];
    let rank_string = "";
    
    for(let i = 0; i < players.length; i++) {
        rank_string += ctx.t("Info_atRank_text", { rank: i, name: players[i].name, point: players[i].point});
        rank_string += "\n";
    }

    await ctx.reply(rank_string, {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtRank
    });
});



// -------------- /wallet ----------------------------------------
// -------------------------------------------------------------
bot.filter(hears("Wallet_atStart_button"), async (ctx) => {
    const keyboardAtWallet = new Keyboard() 
                                .webApp(ctx.t("Connect_atWallet_button"), "https://jasonplato.github.io/my-twa/")
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atWallet_text", { address: walletAddr}), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtWallet
    });
});
bot.command("wallet", async (ctx) => {
    const keyboardAtWallet = new Keyboard() 
                                .webApp(ctx.t("Connect_atWallet_button"), "https://jasonplato.github.io/my-twa/")
                                .row()
                                .text(ctx.t("Back_Home_button"))
                                .resized();

    await ctx.reply(ctx.t("Info_atWallet_text", { address: walletAddr}), {
      // `reply_to_message_id` 指定实际的回复哪一条信息。
      reply_markup: keyboardAtWallet
    });
});




// -------------- Message Receive ----------------------------------------
// -----------------------------------------------------------------------
bot.on("message:web_app_data", async (ctx) => {
    walletAddr = ctx.message.web_app_data.data;
    console.log("wallet:", walletAddr);
    await ctx.reply(ctx.t("Info_atWallet_text", {address: walletAddr}))
});

bot.on("callback_query:data", async (ctx) => {
    console.log("Unknown button event with payload", ctx.callbackQuery.data);
    await ctx.answerCallbackQuery(); // 移除加载动画
});

// Register listeners to handle messages
bot.on("message:text", async (ctx) => {
    await ctx.reply("Echo: " + ctx.t(ctx.message.text))
    console.log("message:", ctx.message);
});

// Start the bot (using long polling)
bot.start();