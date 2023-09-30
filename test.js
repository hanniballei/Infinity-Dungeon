import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { HttpsProxyAgent } from 'https-proxy-agent';
require('dotenv').config();
const {Bot, session, InlineKeyboard, Keyboard, Text} = require("grammy");
const { I18n } = require("@grammyjs/i18n");
const { hears } = require("@grammyjs/i18n");
// 导入数据库
// import { dbpool, users, players, monsters } from './db.js';
import { connection, users, players, monsters } from './db.js';

const token = process.env.TOKEN;
const http_proxy = process.env.PROXY;
const agent = new HttpsProxyAgent(http_proxy);

const bot = new Bot(token, {
    client: {
      baseFetchConfig: {
        agent,
      },
    },
  });

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

// 存储用户战斗的临时数据
const battle_info = new Map();

// -------------- /start ----------------------------------------
// --------------------------------------------------------------
bot.command('start', async (ctx) => {
  try {
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

     
    const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
    let user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id); 
    const user_name = ctx.msg.chat.first_name;
    const first_start_time = ctx.msg.date; // 获取到本次交互时间
    
    // 如果用户第一次交互，在数据库中记录下用户数据 
    if (user === null) {
      await getData("INSERT INTO users (tg_id, tg_name, wallet_connected, wallet_addr, first_time, is_created) VALUES (?, ?, false, \"NULL\", FROM_UNIXTIME(?), false)", [user_id, user_name, first_start_time]);
    }

    user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id);
    if (!user.is_created) {
      await ctx.reply(ctx.t("welcom_if_not_created"), {
        reply_markup: keyboardAtStart,
      });
    } else {
      await ctx.reply(ctx.t("welcome_if_created", { username: user.tg_name}), {
        reply_markup: keyboardAtStart,
      });
    }
  } catch {
    console.error(err);
  }
});



// -------------- Back Home ----------------------------------------
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
      reply_markup: keyboardAtStart
  });
});



// -------------- Help ----------------------------------------
// --------------------------------------------------------------
bot.filter(hears("Help_atStart_button"), async (ctx) => {
  const keyboardAtHelp = new Keyboard() 
                              .text(ctx.t("Story_atHelp_button"))
                              .text(ctx.t("Suggestion_atHelp_button"))
                              .row()
                              .text(ctx.t("Reward_atHelp_button"))
                              .text(ctx.t("Back_Home_button"))
                              .resized();

  await ctx.reply(ctx.t("Info_atHelp_text"), {
    reply_markup: keyboardAtHelp
  });
});

// ++++++++++++++++ Story ++++++++++++++++++++++++
// (补完)介绍故事的时候可以插入一张图片
bot.filter(hears("Story_atHelp_button"), async (ctx) => {
  await ctx.reply(ctx.t("Story_atHelp_text"));
});

// ++++++++++++++++ Suggestion ++++++++++++++++++++++++
bot.filter(hears("Suggestion_atHelp_button"), async (ctx) => {
  await ctx.reply(ctx.t("Suggestion_atHelp_text"));
});

// ++++++++++++++++ Reward ++++++++++++++++++++++++
// (补完)等经济系统设计好就补全奖励机制的具体细节
bot.filter(hears("Reward_atHelp_button"), async (ctx) => {
  await ctx.reply(ctx.t("Reward_atHelp_text"));
});



// -------------- Language ----------------------------------------
// -------------------------------------------------------------
// (补完)到时候可以加入俄语和西语
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

// ++++++++++++++++ English ++++++++++++++++++++++++
bot.filter(hears("English_atLang_button"), async (ctx) => {
  await ctx.i18n.setLocale("en");

  const keyboardAtLangSub = new Keyboard() 
                              .text(ctx.t("Back_Home_button"))
                              .resized();

  await ctx.reply(ctx.t("Info_atLangSub_text"), {
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
    reply_markup: keyboardAtLangSub
  });
});



// -------------- Hero ----------------------------------------
// --------------------------------------------------------------
bot.filter(hears("Hero_atStart_button"),async (ctx) => {
  const keyboardAtHero_0 = new Keyboard() 
                              .text(ctx.t("Back_Home_button"))
                              .resized();
  const keyboardAtHero_1 = new Keyboard() 
                              .text(ctx.t("Create_atHero_button"))
                              .row()
                              .text(ctx.t("Back_Home_button"))
                              .resized();

  const user_id = (ctx.msg.chat.id).toString();
  let user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id);
  let player = await getData("SELECT * FROM players WHERE tg_id = ?", user_id);

  if (!user.is_created) {
    await ctx.reply(ctx.t("Warn_atHero_text"), {
      reply_markup: keyboardAtHero_1,
    });
  } else {
    await ctx.reply(ctx.t("Info_atHero_text", {
      username: player.name,
      gold: player.gold,
      action_points: player.cur_action_points,
      health : player.cur_hp,
      atk : player.cur_attack,
      def : player.cur_defense,
      spd : player.cur_agility,
      fire_atk : player.fire_atk,
      ice_atk : player.ice_atk,
      poison_atk : player.poison_atk,
      thunder_atk : player.thunder_atk,
      fire_def : player.fire_resist,
      ice_def : player.ice_resist,
      poison_def : player.poison_resist,
      thunder_def : player.thunder_resist,
      health_potion_count : player.health_potion_count,
      action_potion_count : player.action_potion_count
    }), {
      reply_markup: keyboardAtHero_0,
    });
  }
});

// ++++++++++++++++ Create Hero ++++++++++++++++++++++++
/*
创建角色的状态变化：
1. 在players中填入相关的数据
2. users数据库中对应行is_created变为true
*/
bot.filter(hears("Create_atHero_button"),async (ctx) => {
  const keyboardAtHeroCreate = new Keyboard() 
                              .text(ctx.t("Back_Home_button"))
                              .resized();

  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  const user_name = ctx.msg.chat.first_name; 
  
  // (补完)讨论一下体力一天定额多少                         
  await getData("INSERT INTO players (tg_id, name, gold, ranking_points, monster_counts, events_counts, cur_action_points, max_action_points, cur_hp, max_hp, cur_attack, max_attack, cur_defense, max_defense, cur_agility, fire_atk, ice_atk, poison_atk, thunder_atk, fire_resist, ice_resist, poison_resist, thunder_resist, health_potion_count, action_potion_count, status) VALUES (?, ?, 0, 0, 0, 0, 200, 200, 100, 100, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)", 
                [user_id, user_name]
                );
  await getData("UPDATE users SET is_created = true WHERE tg_id = ?", user_id);

  await ctx.reply(ctx.t("Finish_atHeroCreate_text"), {
    reply_markup: keyboardAtHeroCreate,
  });
});



// -------------- Bag ----------------------------------------
// --------------------------------------------------------------
bot.filter(hears("Bag_atStart_button"), async (ctx) => {
  const keyboardAtBag = new Keyboard() 
                              .text(ctx.t("Itemcheck_atBag_button"))
                              .text(ctx.t("Weaponcheck_atBag_button"))
                              .row()
                              .text(ctx.t("Armorcheck_atBag_button"))
                              .text(ctx.t("Back_Home_button"))
                              .resized();

  const user_id = (ctx.msg.chat.id).toString();
  let user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id);      
  
  if (!user.is_created) {
    await ctx.reply(ctx.t("Warn_atBag_text"));
  } else {
    await ctx.reply(ctx.t("Info_atBag_text"), {
      reply_markup: keyboardAtBag,
    });
  }
});

// ++++++++++++++++ Check Item ++++++++++++++++++++++++
bot.filter(hears("Itemcheck_atBag_button"),async (ctx) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("use 🩸", "Use_Health_Potion")
    .text("use 💧", "Use_Action_Potion");
  
  const user_id = (ctx.msg.chat.id).toString();
  let player = await getData("SELECT * FROM players WHERE tg_id = ?", user_id);
  await ctx.reply(ctx.t("Item_atBag_text", {health_potion_count: player.health_potion_count, action_potion_count: player.action_potion_count}), {
      reply_markup: inlineKeyboard,
  });
});

// ++++++++++++++++ use 🩸 ++++++++++++++++++++++++
/*
使用回血药剂的状态变化：
1. players数据表中对应的health_potion_count数字减一
2. players数据表中对应的cur_hp数字加30(暂定/补完)
3. 对应的文本进行更新update
*/
bot.callbackQuery("Use_Health_Potion", async (ctx) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("use 🩸", "Use_Health_Potion")
    .text("use 💧", "Use_Action_Potion");
  
  const user_id = (ctx.msg.chat.id).toString();
  let player = await getData("SELECT * FROM players WHERE tg_id = ?", user_id);
  let player_health_count = player.health_potion_count;
  let player_cur_hp = player.cur_hp;
  let player_max_hp = player.max_hp;

  if (player_health_count === 0) {
    await ctx.editMessageText(ctx.t("Use_Health_Potion_Warn", {
      health_potion_count: player.health_potion_count,
      action_potion_count: player.action_potion_count,
    }), {
      reply_markup: inlineKeyboard,
    });
  } else {
    // 使用回血药剂后的血量
    player_cur_hp = use_health_potion(player_cur_hp, player_max_hp);
    player_health_count = player_health_count - 1;
    await getData("UPDATE players SET health_potion_count = ? WHERE tg_id = ?", [player_health_count, user_id]);
    await getData("UPDATE players SET cur_hp = ? WHERE tg_id = ?", [player_cur_hp, user_id]);
    // 界面弹出提示
    await ctx.answerCallbackQuery({text: ctx.t("Use_Health_Potion_Answer")});
    await ctx.editMessageText(ctx.t("User_Health_Potion_text", {
      cur_hp: player_cur_hp,
      health_potion_count: player_health_count,
      action_potion_count: player.action_potion_count,
    }), {
      reply_markup: inlineKeyboard,
    });
  }
});

// ++++++++++++++++ use 💧 ++++++++++++++++++++++++
/*
使用体力药剂的状态变化：
1. players数据表中对应的action_potion_count数字减一
2. players数据表中对应的cur_action_points数字加30(暂定/补完)
3. 对应的文本进行更新update
*/
bot.callbackQuery("Use_Action_Potion", async (ctx) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("use 🩸", "Use_Health_Potion")
    .text("use 💧", "Use_Action_Potion");
  
  const user_id = (ctx.msg.chat.id).toString();
  let player = await getData("SELECT * FROM players WHERE tg_id = ?", user_id);
  let player_action_count = player.action_potion_count;
  let player_cur_action = player.cur_action_points;
  let player_max_action = player.max_action_points;

  if (player_action_count === 0) {
    await ctx.editMessageText(ctx.t("Use_Action_Potion_Warn", {
      health_potion_count: player.health_potion_count,
      action_potion_count: player.action_potion_count,
    }), {
      reply_markup: inlineKeyboard,
    });
  } else {
    // 使用体力药剂后的体力
    player_cur_action = use_action_potion(player_cur_action, player_max_action);
    player_action_count = player_action_count - 1;
    await getData("UPDATE players SET action_potion_count = ? WHERE tg_id = ?", [player_action_count, user_id]);
    await getData("UPDATE players SET cur_action_points = ? WHERE tg_id = ?", [player_cur_action, user_id]);
    // 界面弹出提示
    await ctx.answerCallbackQuery({text: ctx.t("Use_Action_Potion_Answer")});
    await ctx.editMessageText(ctx.t("User_Action_Potion_text", {
      cur_action_points: player_cur_action,
      health_potion_count: player.health_potion_count,
      action_potion_count: player_action_count,
    }), {
      reply_markup: inlineKeyboard,
    });
  }
});


// ++++++++++++++++ Check Weapon ++++++++++++++++++++++++
// (补完)
bot.filter(hears("Weaponcheck_atBag_button"),async (ctx) => {

});

// ++++++++++++++++ Check Armor ++++++++++++++++++++++++
// (补完)
bot.filter(hears("Armorcheck_atBag_button"),async (ctx) => {

});



// -------------- Shop ----------------------------------------
// --------------------------------------------------------------



// -------------- Rank ----------------------------------------
// --------------------------------------------------------------
bot.filter(hears("Rank_atStart_button"),async (ctx) => {
  const user_id = (ctx.msg.chat.id).toString();
  let user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id);

  if (!user.is_created) {
    await ctx.reply(ctx.t("Warn_atRank_text"));
  } else {
    let player = await getData("SELECT * FROM players WHERE tg_id = ?", user_id);
    if (player.ranking === null) {
      await ctx.reply(ctx.t("Info_NoRank_atRank_text", {ranking_points: player.ranking_points}));
    } else {
      await ctx.reply(ctx.t("Info_atRank_text", {ranking_points: player.ranking_points, ranking: player.ranking}));
    }
  }
});




// -------------- Battle ----------------------------------------
// --------------------------------------------------------------
/*
记得在数据库中将player的status从0变为1
*/
bot.filter(hears("Battle_atStart_button"), async (ctx) => {
  const keyboardAtEventStart = new Keyboard() 
                                .text(ctx.t("Continue_atEventStart_button"))
                                .text(ctx.t("Back_Home_button"))
                                .resized();
  
  const keyboardAtBattleStart = new Keyboard() 
                                .text(ctx.t("ContinueFight_atBattleStart_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .resized();

  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  let user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id); 

  // 检查角色是否创建
  if (!user.is_created) {
    await ctx.reply(ctx.t("Warn_Create_atBattle_text"));
  } else {
    let player = await getData("SELECT * FROM players WHERE tg_id = ?", user_id);
    // 检查角色体力值是否足够
    if (player.cur_action_points < 10) {
      await ctx.reply(ctx.t("Warn_Action_atBattle_text"));
    } else {
      const event_or_not = eventProb();
      console.log(event_or_not);
      if (event_or_not) {
        await ctx.reply(ctx.t(`Intro_atEventStart_text`), {
          reply_markup: keyboardAtEventStart,
        });
      } else {
        // 生成怪物，并将player和cur_monster一起存入map中
        let monster = await getData("SELECT * FROM monsters ORDER BY RAND() LIMIT ?", 1);
        let cur_monster = createMonster(player, monster);

        // 体力扣掉10点
        player.cur_action_points = player.cur_action_points - 10;
        const player_agility = player.cur_agility;
        const monster_agility = cur_monster.cur_agility;

        // player_fight为true代表先手发动攻击，false代表后手发动攻击
        // 比较玩家和怪物的敏捷值，然后发送不同的通知
        if (player_agility >= monster_agility) {
          battle_info.set(user_id, {
            player: player,
            monster: cur_monster,
            player_fight: true,
            // ratio
          });
          await ctx.reply(ctx.t(`MeetMonster_First_atBattle_text`, {
            monster_name: cur_monster.monster_name,
            monster_race: cur_monster.monster_race,
            health : cur_monster.cur_hp,
            atk : cur_monster.cur_attack,
            def : cur_monster.cur_defense,
            spd : cur_monster.cur_agility,
            fire_atk : cur_monster.fire_atk,
            ice_atk : cur_monster.ice_atk,
            poison_atk : cur_monster.poison_atk,
            thunder_atk : cur_monster.thunder_atk,
            fire_def : cur_monster.fire_resist,
            ice_def : cur_monster.ice_resist,
            poison_def : cur_monster.poison_resist,
            thunder_def : cur_monster.thunder_resist,
          }), {
            reply_markup: keyboardAtBattleStart,
          });
        } else {
          battle_info.set(user_id, {
            player: player,
            monster: cur_monster,
            player_fight: false,
            // ratio
          });
          await ctx.reply(ctx.t(`MeetMonster_Second_atBattle_text`, {
            monster_name: cur_monster.monster_name,
            monster_race: cur_monster.monster_race,
            health : cur_monster.cur_hp,
            atk : cur_monster.cur_attack,
            def : cur_monster.cur_defense,
            spd : cur_monster.cur_agility,
            fire_atk : cur_monster.fire_atk,
            ice_atk : cur_monster.ice_atk,
            poison_atk : cur_monster.poison_atk,
            thunder_atk : cur_monster.thunder_atk,
            fire_def : cur_monster.fire_resist,
            ice_def : cur_monster.ice_resist,
            poison_def : cur_monster.poison_resist,
            thunder_def : cur_monster.thunder_resist,
          }), {
            reply_markup: keyboardAtBattleStart,
          });
        }
        console.log(battle_info.get(user_id).monster);
      }  
    }
  }
});

// ++++++++++++++++ Continue Event ++++++++++++++++++++++++
/*
事件结束后的状态变化：
1. 体力-10，存入数据库
2. 如果运气好，获得一定的奖励
*/
// (补完)多做几个事件
bot.filter(hears("Continue_atEventStart_button"),async (ctx) => {
  // (补完)设计一个随机数，然后随机一个事件
  const keyboardAtEvent = new Keyboard() 
                          .text(ctx.t("SendDice_atEvent1_button"))
                          .text(ctx.t("Back_Home_button"))
                          .resized();
  await ctx.reply(ctx.t("Info_atEvent1_text"), {
    reply_markup: keyboardAtEvent,
  });
});

// ++++++++++++++++ Event1 ++++++++++++++++++++++++
bot.filter(hears("SendDice_atEvent1_button"),async (ctx) => {
  // (补完)设计一个随机数，然后随机一个事件
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
  
  const user_id = (ctx.msg.chat.id).toString();
  const dices = await ctx.api.sendDice(user_id);
  const dice_value = dices.dice.value;
  if (dice_value === 6) {
    await getData("UPDATE players SET gold = gold + ? WHERE tg_id = ?", [20, user_id]);
    await getData("UPDATE players SET cur_action_points = cur_action_points - ? WHERE tg_id = ?", [10, user_id]);
    await ctx.reply(ctx.t("Result1_atEvent1_text"), {
      reply_markup: keyboardAtStart,
    });
  } else {
    await getData("UPDATE players SET cur_action_points = cur_action_points - ? WHERE tg_id = ?", [10, user_id]);
    await ctx.reply(ctx.t("Result2_atEvent1_text", {dice_value: dice_value}), {
      reply_markup: keyboardAtStart,
    });
  }
});



// ++++++++++++++++ Surrender ++++++++++++++++++++++++
/*
选择投降的状态变化：
1. battle_info中key-value清除
2. 如果用户扔骰子失败则血量扣掉百分之10，cur_hp修改（是否需要扣掉一定的排名点数）
*/
bot.filter(hears("Surrender_atBattleStart_button"),async (ctx) => {
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
  
  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  const dices = await ctx.api.sendDice(user_id);
  const dice_value = dices.dice.value;
  if (dice_value < 3) {
    // （补完）状态修改，扣除10%的血量以及一些排名点数，对应字段是cur_hp和ranking_points
    // （补完）如何使扣除的排名点数为整数

    battle_info.delete(user_id);
    ctx.reply(ctx.t("Surrender_atBattle1_text", {dice_value: dice_value}), {
      reply_markup: keyboardAtStart,
    });
  } else {
    // （补完）状态修改，扣除一些排名点数
    // 如果排名点数为0，则不做修改

    battle_info.delete(user_id); // 删除map中的记录
    ctx.reply(ctx.t("Surrender_atBattle2_text", {dice_value: dice_value}), {
      reply_markup: keyboardAtStart,
    });
  }
});

// ++++++++++++++++ ContinureFight ++++++++++++++++++++++++
/*
战斗结束的状态变化：
1. 血量回满，没有异常状态（目前还没设计异常状态），存入数据库中
2. 如果战胜则获得排名积分/游戏币/随机掉落的武器，存入数据库中
3. status从1变为0。存入数据库中
4. 体力值-10，存入数据库中
5. 删除map中的条目
*/
bot.filter(hears("ContinueFight_atBattleStart_button"),async (ctx) => {
  const keyboardAtBattle_PlayerFirst = new Keyboard() 
                                .text(ctx.t("SendDice_atBattleStart_PlayerFirst_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .resized();

  const keyboardAtBattle_MonsterFirst = new Keyboard() 
                                .text(ctx.t("SendDice_atBattleStart_MonsterFirst_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .resized();   

  const user_id = (ctx.msg.chat.id).toString();
  let cur_battle = battle_info.get(user_id);
  let player_cur_hp = cur_battle.player.cur_hp;
  let monster_cur_hp = cur_battle.monster.cur_hp;
  
  if (player_cur_hp > 0 && monster_cur_hp > 0) {
    if (cur_battle.player_fight) {
      // (补完)暂时不能使用背包中的物品
      ctx.reply(ctx.t("ContinueFight_First_atBattle1_text"), {
        reply_markup: keyboardAtBattle_PlayerFirst,
      });
    } else {
      ctx.reply(ctx.t("ContinueFight_First_atBattle1_text2"), {
        reply_markup: keyboardAtBattle_MonsterFirst,
      });
    }
  } 
});

// ++++++++++++++++ SendDice Player Attack ++++++++++++++++++++++++
/*
战斗胜利的状态变化：
1. 血量回满，没有异常状态（目前还没设计异常状态），存入数据库中
2. 如果战胜则获得排名积分/游戏币/随机掉落的武器，存入数据库中
3. status从1变为0。存入数据库中
4. 体力值-10，存入数据库中
5. 删除map中的条目
6. monster_counts+1，存入数据库中
*/
bot.filter(hears("SendDice_atBattleStart_PlayerFirst_button"),async (ctx) => {
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

  const keyboardAtBattle_MonsterFirst = new Keyboard() 
                                .text(ctx.t("SendDice_atBattleStart_MonsterFirst_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .resized(); 
  const keyboardWaiting = new Keyboard()
                                .text(ctx.t("Waiting_For_Turn_End_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .resized(); 
  ctx.reply(ctx.t("Waiting_atBattle_text"), {
    reply_markup: keyboardWaiting,
  });
  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  let cur_battle = battle_info.get(user_id);
  const dices = await ctx.api.sendDice(user_id);
  const dice_value = dices.dice.value;
  const dmg = damage("player", cur_battle.player, cur_battle.monster, dice_value);

  // (补完)到时候monster这个词条需要修改
  cur_battle.monster.cur_hp = cur_battle.monster.cur_hp - dmg;

  if (cur_battle.monster.cur_hp <= 0) {
    ctx.reply(ctx.t("Attack_atBattle1_text", {dmg: dmg, monster_cur_hp: cur_battle.monster.cur_hp, cur_hp: cur_battle.player.cur_hp}), {
      reply_markup: keyboardAtStart,
    });
    battle_info.delete(user_id); // 删除map中的记录
  } else {
    ctx.reply(ctx.t("Attack_atBattle2_text" , {dmg: dmg, monster_cur_hp: cur_battle.monster.cur_hp, cur_hp: cur_battle.player.cur_hp}), {
      reply_markup: keyboardAtBattle_MonsterFirst,
    });
  }
});

// ++++++++++++++++ SendDice Player Defense ++++++++++++++++++++++++
/*
战斗失败的状态变化：
1. 血量变为最大值的90%，没有异常状态（目前还没设计异常状态），存入数据库中
2. 扣除一定的排名点数，存入数据库
3. status从1变为0。存入数据库中
4. 体力值-10，存入数据库中
5. 删除map中的条目
*/
bot.filter(hears("SendDice_atBattleStart_MonsterFirst_button"),async (ctx) => {
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
  
  const keyboardAtBattle_PlayerFirst = new Keyboard() 
                                .text(ctx.t("SendDice_atBattleStart_PlayerFirst_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .resized(); 

  const keyboardWaiting = new Keyboard()
                                .text(ctx.t("Waiting_For_Turn_End_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .resized();    

  ctx.reply(ctx.t("Waiting_atBattle_text"), {
      reply_markup: keyboardWaiting,
  });
  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  let cur_battle = battle_info.get(user_id);
  const dices = await ctx.api.sendDice(user_id);
  const dice_value = dices.dice.value;
  const dmg = damage("monster", cur_battle.player, cur_battle.monster, dice_value);
  
  cur_battle.player.cur_hp = cur_battle.player.cur_hp - dmg;

  // (补完)到时候monster这个词条需要修改
  if (cur_battle.player.cur_hp <= 0) {
    ctx.reply(ctx.t("Defense_atBattle1_text", {dmg: dmg, monster_cur_hp: cur_battle.monster.cur_hp, cur_hp: cur_battle.player.cur_hp}), {
      reply_markup: keyboardAtStart,
    });
    battle_info.delete(user_id); // 删除map中的记录
  } else {
    ctx.reply(ctx.t("Defense_atBattle2_text", {dmg: dmg, monster_cur_hp: cur_battle.monster.cur_hp, cur_hp: cur_battle.player.cur_hp}), {
      reply_markup: keyboardAtBattle_PlayerFirst,
    });
  }
});

bot.filter(hears("Waiting_For_Turn_End_button"),async (ctx) => {
  ctx.reply(ctx.t("Just Waiting For the Turn End."));
});


/*
bot.filter(hears("ContinueFight_atBattleStart_button"),async (ctx) => {

});
*/

function getData(sqlaction, params) {
  return new Promise((resolve, reject) => {
    connection.query(sqlaction, params, (err, results) => {
      if (err) {
        console.error("Error executing query: ", err.message);
        reject(err);
      } else {
        if (results.length > 0) {
          let result_data = results[0];
          // console.log("Get Database Data: ", result_data);
          resolve(result_data); // 解析查询结果并将其返回
        } else {
          console.log("Not Found This Data");
          resolve(null); // 返回空值
        }
      }
    });
  });
}

/*
// 通过sql语句返回查询的信息
// 使用Promise来处理异步操作
function getData(sqlaction, params) {
  return new Promise((resolve, reject) => {
    dbpool.getConnection((err, connection) => {
      if (err)
        console.log("connection failed");
      else {
        dbpool.query(sqlaction, params, (err, results) => {
          if (err) {
            console.error("Error executing query: ", err.message);
            reject(err);
          } else {
            if (results.length > 0) {
              let result_data = results[0];
              // console.log("Get Database Data: ", result_data);
              resolve(result_data); // 解析查询结果并将其返回
            } else {
              console.log("Not Found This Data");
              resolve(null); // 返回空值
            }
          }

          connection.release();
        });
      }
    })
    
  });
}
*/

// 使用回血药剂后的血量
function use_health_potion(cur_hp, max_hp) {
  const hp_after_use = cur_hp + 30;
  if (hp_after_use > max_hp) {
    return max_hp;
  } else {
    return hp_after_use;
  }
}

// 使用体力药剂后的体力
function use_action_potion(cur_action, max_action) {
  const action_after_user = cur_action + 50;
  if (action_after_user > max_action) {
    return max_action;
  } else {
    return action_after_user;
  }
}


// 生成一个随机数，如果小于等于0.15则为事件，否则为怪物
function eventProb() {
  const random = Math.random();
  if (random <= 0.15) {
    return true;
  } else {
    return false;
  }
}



// 算出要迎战的怪物的数值
// (补完)设置一个ratio区间
// (补完)限制怪物血量
function createMonster(player, monster) {
  const attribut_sum = player.cur_attack + player.cur_defense + 
                       player.fire_atk + player.ice_atk + player.poison_atk + player.thunder_atk +
                       player.fire_resist + player.ice_resist + player.poison_resist + player.thunder_resist;
                       
  console.log("attribut_sum: ", attribut_sum);
  const ratio = attribut_sum / 100;
  console.log("ratio: ", ratio)
  let cur_monster = new Object();
  cur_monster.monster_name = monster.monster_name;
  cur_monster.monster_race = monster.monster_race;
  cur_monster.cur_hp = monster.base_hp * ratio;
  cur_monster.cur_attack = monster.base_attack * ratio;
  cur_monster.cur_defense = monster.base_defense * ratio;
  cur_monster.cur_agility = monster.base_agility * ratio;
  cur_monster.fire_atk = monster.fire_atk * ratio;
  cur_monster.ice_atk = monster.ice_atk * ratio;
  cur_monster.poison_atk = monster.poison_atk * ratio;
  cur_monster.thunder_atk = monster.thunder_atk * ratio;
  cur_monster.fire_resist = monster.fire_resist * ratio;
  cur_monster.ice_resist = monster.ice_resist * ratio;
  cur_monster.poison_resist = monster.poison_resist * ratio;
  cur_monster.thunder_resist = monster.thunder_resist * ratio;
  return cur_monster;
}

function damage(first, player, monster, dice_value) {
  let sum_dmg;
  let normal_dmg;
  let fire_dmg;
  let ice_dmg;
  let poison_dmg;
  let thunder_dmg;
  let dice_bonus;
  console.log("player and monster are ready");

  if (first === "player") {
    normal_dmg = normalDmg(player.cur_attack, monster.cur_defense);
    fire_dmg = fireDmg(player.fire_atk, monster.fire_resist);
    ice_dmg = iceDmg(player.ice_atk, monster.ice_resist);
    poison_dmg = poisonDmg(player.poison_atk, monster.poison_resist);
    thunder_dmg = thunderDmg(player.thunder_atk, monster.thunder_resist);

    sum_dmg = normal_dmg + fire_dmg + ice_dmg + poison_dmg + thunder_dmg;
    dice_bonus = diceBonus(dice_value);
    sum_dmg = sum_dmg * (1 + dice_bonus);
    console.log(`player_atk: ${player.cur_attack}, monster_atk: ${monster.cur_defense}, normal_dmg: ${normal_dmg}, fire_dmg: ${fire_dmg}, ice_dmg: ${ice_dmg}, poison_dmg: ${poison_dmg}, thunder_dmg: ${thunder_dmg}`);
  } else {
    normal_dmg = normalDmg(monster.cur_attack, player.cur_defense);
    fire_dmg = fireDmg(monster.fire_atk, player.fire_resist);
    ice_dmg = iceDmg(monster.ice_atk, player.ice_resist);
    poison_dmg = poisonDmg(monster.poison_atk, player.poison_resist);
    thunder_dmg = thunderDmg(monster.thunder_atk, player.thunder_resist);
    
    sum_dmg = normal_dmg + fire_dmg + ice_dmg + poison_dmg + thunder_dmg;
    dice_bonus = diceBonus(dice_value);
    sum_dmg = sum_dmg * (1 - dice_bonus);
    console.log(`normal_dmg: ${normal_dmg}, fire_dmg: ${fire_dmg}, ice_dmg: ${ice_dmg}, poison_dmg: ${poison_dmg}, thunder_dmg: ${thunder_dmg}`);
  }
  return sum_dmg;
}

function normalDmg(attack, defense) {
  let normal_dmg;
  let bonus;
  if (attack >= defense) {
    bonus = 1 + ((attack - defense) / attack);
    normal_dmg = attack * bonus;
  } else {
    bonus = 1 - ((defense - attack) / defense);
    normal_dmg = attack * bonus;
  }
  return normal_dmg;
}

function fireDmg(fire_atk, fire_resist) {
  let fire_dmg = 0;
  let bonus;
  
  if (fire_atk === 0) {
    return fire_dmg;
  } else if (fire_atk >= fire_resist) {
    bonus = 1 + ((fire_atk - fire_resist) / fire_atk);
    fire_dmg = fire_atk * bonus;
  } else {
    bonus = 1 - ((fire_resist - fire_atk) / fire_resist);
    fire_dmg = fire_atk * bonus;
  }
  return fire_dmg;
}

function iceDmg(ice_atk, ice_resist) {
  let ice_dmg = 0;
  let bonus;
  
  if (ice_atk === 0) {
    return ice_dmg;
  } else if (ice_atk >= ice_resist) {
    bonus = 1 + ((ice_atk - ice_resist) / ice_atk);
    ice_dmg = ice_atk * bonus;
  } else {
    bonus = 1 - ((ice_resist - ice_atk) / ice_resist);
    ice_dmg = ice_atk * bonus;
  }
  return ice_dmg;
}

function poisonDmg(poison_atk, poison_resist) {
  let poison_dmg = 0;
  let bonus;
  
  if (poison_atk === 0) {
    return poison_dmg;
  } else if (poison_atk >= poison_resist) {
    bonus = 1 + ((poison_atk - poison_resist) / poison_atk);
    poison_dmg = poison_atk * bonus;
  } else {
    bonus = 1 - ((poison_resist - poison_atk) / poison_resist);
    poison_dmg = poison_atk * bonus;
  }
  return poison_dmg;
}

function thunderDmg(thunder_atk, thunder_resist) {
  let thunder_dmg = 0;
  let bonus;
  if (thunder_atk === 0) {
    return thunder_dmg;
  } else if (thunder_atk >= thunder_resist) {
    bonus = 1 + ((thunder_atk - thunder_resist) / thunder_atk);
    thunder_dmg = thunder_atk * bonus;
  } else {
    bonus = 1 - ((thunder_resist - thunder_atk) / thunder_resist);
    thunder_dmg = thunder_atk * bonus;
  }
  return thunder_dmg;
}

function diceBonus(dice_value) {
  let dice_bonus = (dice_value - 3) * 0.1;
  return dice_bonus;
}


bot.start();