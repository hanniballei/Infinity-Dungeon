import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { HttpsProxyAgent } from 'https-proxy-agent';
require('dotenv').config();
const {Bot, session, InlineKeyboard, Keyboard, Text} = require("grammy");
const { I18n } = require("@grammyjs/i18n");
const { hears } = require("@grammyjs/i18n");
// 导入数据库
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
    const first_start_time = ctx.msg.date; // 获取到本次交互时间
    
    // 如果用户第一次交互，在数据库中记录下用户数据 
    if (user == null) {
      await getData("INSERT INTO users (tg_id, wallet_connected, wallet_addr, first_time, is_created) VALUES (?, false, \"NULL\", FROM_UNIXTIME(?), true)", [user_id, first_start_time]);
    }

    user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id);
    if (!user.is_created) {
      await ctx.reply(ctx.t("you haven't created a role, please enter Hero button to start game!"), {
        reply_markup: keyboardAtStart,
      });
    } else {
      await ctx.reply(ctx.t("welcome Back!"), {
        reply_markup: keyboardAtStart,
      });
    }
  } catch {
    console.error(err);
  }
});


bot.filter(hears("Battle_atStart_button"), async (ctx) => {
  const keyboardAtBattleStart = new Keyboard() 
                                .text(ctx.t("ContinueFight_atBattleStart_button"))
                                .text(ctx.t("Surrender_atBattleStart_button"))
                                .row()
                                .text(ctx.t("Hero_atBattleStart_button"))
                                .text(ctx.t("Bag_atBattleStart_button"))
                                .resized();

  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  let user = await getData("SELECT * FROM users WHERE tg_id = ?", user_id); 

  // 检查角色是否创建
  if (!user.is_created) {
    await ctx.reply(ctx.t("Sorry, you haven't created a role. Please enter Hero button to start game!"));
  } else {
    let player = await getData("SELECT * FROM players WHERE tg_id = ?", user_id);
    // 检查角色体力值是否足够
    if (player.cur_action_points < 10) {
      // 界面弹出提示，这个暂时没有找到合适的方法
      await ctx.reply(ctx.t("You don't have enough action points to battle. Please use xxx in the bag"));
    } else {
      // （补完）做一个0-1随机数生成器。如果在0-0.2之间触发事件，剩下的触发战斗
      // 这里先做战斗的逻辑，到时候事件完善了再弄事件/战斗判断分支

      // 生成怪物，并将player和monster一起存入map中
      // （补完）根据人物当前的刷怪数和状态计算怪物的状态
      let monster = await getData("SELECT * FROM monsters ORDER BY RAND() LIMIT ?", 1);

      // 体力扣掉10点
      player.cur_action_points = player.cur_action_points - 10;
      console.log(player.cur_action_points);
      const player_agility = player.cur_agility;
      // (补完)这部分的字段到时候需要修改
      const monster_agility = monster.base_agility;
      // player_fight为true代表先手发动攻击，false代表后手发动攻击
      if (player_agility >= monster_agility) {
        battle_info.set(user_id, {
          player: player,
          monster: monster,
          player_fight: true,
        });
      } else {
        battle_info.set(user_id, {
          player: player,
          monster: monster,
          player_fight: false,
        });
      }

      // Bot发送遇到怪物的文本提示
      // （补完）在这里显示怪物是否先手进攻玩家
      await ctx.reply(ctx.t(`You meet a monster named ${monster.monster_name}`), {
        reply_markup: keyboardAtBattleStart,
      });
    }
  }
});

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

    battle_info.delete(user_id);
    console.log(battle_info.get(user_id));
    ctx.reply(ctx.t(`The dice value is ${dice_value}, smaller than 3. Rolling is failed, you are deducted xxx points`), {
      reply_markup: keyboardAtStart,
    });
  } else {
    // （补完）状态修改

    battle_info.delete(user_id); // 删除map中的记录
    ctx.reply(ctx.t(`The dice value is ${dice_value}, not smaller than 3. Rolling is successful, you escaped from the battle`), {
      reply_markup: keyboardAtStart,
    });
  }
});

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
  // (补完)到时候这个base_hp要修改
  let monster_cur_hp = cur_battle.monster.base_hp;
  
  if (player_cur_hp > 0 && monster_cur_hp > 0) {
    if (cur_battle.player_fight) {
      // (补完)暂时不能使用背包中的物品
      ctx.reply(ctx.t(`This turn you attack first.\n
        Please enter "Rolling for Fight" button to determine your damage bonus against the monster`), {
        reply_markup: keyboardAtBattle_PlayerFirst,
      });
    } else {
      ctx.reply(ctx.t(`This turn monster attacks first.\n
        Please enter "Rolling for Defence" button to determine your defence bonus against the monster`), {
        reply_markup: keyboardAtBattle_MonsterFirst,
      });
    }
  }
  
  if (cur_battle.player_fight) {
    ctx.reply(ctx.t(`Because your agility is bigger than monster's, so you battle first`), {
      reply_markup: keyboardAtStart,
    });
  }
  
});

/*
战斗胜利的状态变化：
1. 血量回满，没有异常状态（目前还没设计异常状态），存入数据库中
2. 如果战胜则获得排名积分/游戏币/随机掉落的武器，存入数据库中
3. status从1变为0。存入数据库中
4. 体力值-10，存入数据库中
5. 删除map中的条目
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

  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  let cur_battle = battle_info.get(user_id);
  const dices = await ctx.api.sendDice(user_id);
  const dice_value = dices.dice.value;
  const dmg = damage("player", cur_battle.player, cur_battle.monster, dice_value);

  // (补完)到时候monster这个词条需要修改
  let monster_cur_hp = cur_battle.monster.base_hp - dmg;
  if (monster_cur_hp <= 0) {
    ctx.reply(ctx.t(`Your give ${dmg} damage for the monster. Now it has ${monster_cur_hp} hp, and you have ${cur_battle.player.cur_hp} hp\n
    Congragulation! You beat this monster successfully!`), {
      reply_markup: keyboardAtStart,
    });
  } else {
    ctx.reply(ctx.t(`Your give ${dmg} damage for the monster. Now it has ${monster_cur_hp} hp, and you have ${cur_battle.player.cur_hp} hp\n
    The following ture is monster's attack turn, please enter "Rolling for defense" button to determine your defence bonus against the monster `), {
      reply_markup: keyboardAtBattle_MonsterFirst,
    });
    battle_info.delete(user_id); // 删除map中的记录
  }
});

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

  const user_id = (ctx.msg.chat.id).toString();  // 需要对用户telegram_id进行格式转换
  let cur_battle = battle_info.get(user_id);
  const dices = await ctx.api.sendDice(user_id);
  const dice_value = dices.dice.value;
  const dmg = damage("monster", cur_battle.player, cur_battle.monster, dice_value);
  
  let player_cur_hp = cur_battle.player.cur_hp - dmg;
  // (补完)到时候monster这个词条需要修改
  if (player_cur_hp <= 0) {
    ctx.reply(ctx.t(`Your are given ${dmg} damage from the monster. Now it has ${cur_battle.monster.base_hp} hp, and you have ${player_cur_hp} hp\n
    Sorry, you've been defeated by the monster`), {
      reply_markup: keyboardAtStart,
    });
  } else {
    ctx.reply(ctx.t(`Your give ${dmg} damage for the monster. Now it has ${cur_battle.monster.base_hp} hp, and you have ${player_cur_hp} hp\n
    The following ture is your attack turn, please enter "Rolling for attack" button to determine your defence bonus against the monster `), {
      reply_markup: keyboardAtBattle_PlayerFirst,
    });
    battle_info.delete(user_id); // 删除map中的记录
  }
});

/*
bot.filter(hears("ContinueFight_atBattleStart_button"),async (ctx) => {

});
*/


// 通过sql语句返回查询的信息
// 使用Promise来处理异步操作
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

// (补完)加入元素伤害
function damage(first, player, monster, dice_value) {
  let sum_dmg;
  let normal_dmg;
  // let fire_dmg;
  // let ice_dmg;
  // let toxic_dmg;
  // let thunder_dmg;
  let dice_bonus;

  if (first === "player") {
    // (补完)到时候monster的这个字段需要改动
    normal_dmg = normalDmg(player.cur_attack, monster.base_defense);
    // 之后会加入元素伤害
    sum_dmg = normal_dmg;
    dice_bonus = diceBonus(dice_value);
    sum_dmg = sum_dmg * (1 + dice_bonus);
  } else {
    normal_dmg = normalDmg(monster.base_attack, player.cur_defense);
    // 之后会加入元素伤害
    sum_dmg = normal_dmg;
    dice_bonus = diceBonus(dice_value);
    sum_dmg = sum_dmg * (1 - dice_bonus);
  }
  return sum_dmg;
}

function normalDmg(attack, defense) {
  let normal_dmg;
  let bonus;
  if (attack >= defense) {
    bonus = 1 + ((attack - defense) / attack);
    normal_dmg = attack * (1 + bonus);
  } else {
    bonus = 1 - ((defense - attack) / attack);
    normal_dmg = attack * (1 - bonus);
  }
  return normal_dmg;
}

function diceBonus(dice_value) {
  let dice_bonus = (dice_value - 3) * 0.15;
  return dice_bonus;
}


bot.start();