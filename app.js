import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { HttpsProxyAgent } from 'https-proxy-agent';
require('dotenv').config();
const {Bot, InlineKeyboard, Keyboard, Text} = require("grammy");

const token = process.env.TOKEN;
const agent = new HttpsProxyAgent("http://192.168.10.4:4780");

const bot = new Bot(token, {
    client: {
      baseFetchConfig: {
        agent,
      },
    },
  });

// 导入数据库
import { connection, users, players, roles, monsters } from './db.js';

// 'start'的功能最后需要合并
bot.command('start', async (ctx) => {
  console.log(ctx.msg);
  ctx.reply("This is a Text-based RPG Game\nHere is some useful commands");
  /*
  try {
    const user_id = (ctx.msg.chat.id).toString();
    let user = await getData("SELECT * FROM users WHERE telegram_id = ?", user_id);
    let is_connect_wallet = user.is_connect_wallet;

    if (!is_connect_wallet) {
      ctx.reply("This is a Text-based RPG Game\nYou need to connect wallet first.");
    } else {
      ctx.reply("This is a Text-based RPG Game\nHere is some useful commands");
    }
  } catch {
    console.error(err);
  }
  */
});

bot.command('hero', async (ctx) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("骑士", "Paladin")
    .text("精灵", "Elf")
    .row()
    .text("法师", "Mage")
    .text("术士", "Cleric");

  // 每个用户在第一次输入/start以后就会在users和players表单中创建一行数据
  // let hero = db.players.findOne({id: ctx.from.id});  
  // let if_existplayer = hero.new_player;
  let if_existplayer = false; 

  // 如果没有创建新角色，则选择一个职业进行创建
  if (!if_existplayer) {
    await ctx.reply("您还未创建角色，下面有四个角色供您选择。这四个职业的特点是......请选择你要创建的职业：", {
      reply_markup: inlineKeyboard,
    });
  } else {
    // 可以使用showHeroInfo函数来显示具体的玩家数据
    await ctx.reply("下面是你目前的角色信息.....");
  }
});

// 相应用户点击创建“骑士”角色
// ctx.callbackQuery.data代表按键的文字
bot.callbackQuery("Paladin", async (ctx) => {
  // 更新数据库
  /*
  let roleData = db.roles.findOne({id: 1});
  await db.players.update(ctx.from.id, {
    job: job,
    hp: jobData.hp,
    atk: jobData.atk, 
    def: jobData.def,
    // 只更新与职业相关的属性
    // 等级更新为1
    // new_player字段变为true，等角色死亡再改回false
  });
  let player = await db.players.findOne({id: ctx.from.id});
  */

  // 界面弹出提示
  await ctx.answerCallbackQuery({text: "骑士职业创建成功"});
  // 可以使用showHeroInfo函数来显示具体的玩家数据
  await ctx.reply("恭喜您骑士职业创建成功，下面是你目前的角色信息......" );
});

// 相应用户点击创建“精灵”角色

// 相应用户点击创建“法师”角色

// 相应用户点击创建“术士”角色

//
bot.command("battle", async (ctx) => {
  // 检查钱包是否连接

  // 检查角色是否创建
  // ctx.hero = db.players.findOne({id: ctx.from.id});  
  // let if_existplayer = ctx.hero.new_player;
  // let level = ctx.hero.level;

  let if_existplayer = false;
  if (!if_existplayer) {
    // await ctx.reply("很抱歉，您还没有创建角色，请输入[/hero]创建一个角色");
    await ctx.reply("Hi 我只能收到明确回复我的信息！", {
      // 让 Telegram 客户端自动向用户显示回复界面。
      reply_markup: { force_reply: true },
    });
  } else {
    // 增加一个0-1的随机数，如果随机数<0.8，则是和怪物对战。否则是随机事件。
    // 从数据库中抽取一个随机的怪物种类，用来生成对手，返回一个Object。ctx.monster用于在上下文之间传递monster信息
    // ctx.monster = generateMonster(level);
    // 配合showHeroInfo显示怪物信息
    const inlineKeyboard = new InlineKeyboard()
      .text("逃跑吧~", "flee")
      .text("继续战斗！", "continue_battle");
    await ctx.reply("遭遇xxx怪物, 其属性为: ", {
      reply_markup: inlineKeyboard,
    });
  }
});

bot.callbackQuery("flee", async (ctx) => {

});

bot.callbackQuery("continue_battle", async (ctx) => {
  // let energy = ctx.hero.current_enery;
  // 判断用户当前能量是否大于等于10，即是否用体力打一只怪
  /*
  if (energy >= 10) {
    // energy-10并在数据库中进行更新
    // 判断
  } else {
    ctx.reply("你现在的体力值不够，可以去商店购买、等体力自然恢复或者每天中午十二点和下午六点领取体力");
  }
  */
});

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
          console.log("Get Database Data: ", result_data);
          resolve(result_data); // 解析查询结果并将其返回
        } else {
          console.log("Not Found This Data");
          resolve(null); // 返回空值
        }
      }
    });
  });
}

// 展示角色信息
function showHeroInfo(player) {
  return "Hero Info: xxx" 
  /*
  `${player.name}-${player.job} 
  等级:${player.level}
  经验:${player.exp}
  // 其他属性
`*/;
}

// 根据玩家等级生成随机怪物
function generateMonster(level) {
  // 随机从monsters数据表中抽取一行，就可以当做随机抽取一个怪物模板
  // let base_monster = db.monsters.sample(1)[0];
  // monster_level = monsterLevel(level);
  // 根据等级规则生成怪物的最终数据，并将其作为一个Object输出
  // ...
  // const monster = {};
  // return monster;
}

// 根据玩家等级决定怪物的等级
// 需要复核
/*
function monsterLevel(level) {
  // 生成0-1之间的随机小数
  const random = Math.random();
  if (level === 1) {
    return 1;
  } else if (level <= 10) {
    if (random < 0.75) {
      return level;
    } else {
      return (level - 1);
    }
  } else if (level <= 30) {
    if (random < (0.00625*(level-10))) {
      return (level - 1);
    }
  }
}
*/

bot.start();
