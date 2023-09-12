require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const http_proxy = process.env.PROXY;
// const Agent = require('socks5-https-client/lib/Agent');

requestOptions = {
    proxy: http_proxy,
};

// polling是指这个bot会每隔一段时间询问tel服务器是否有用户请求这个bot
const bot = new TelegramBot(token, {
    polling: true,
    request: requestOptions,
});

// on方法第一个参数记录一个事件。第二个参数是一个回调函数
bot.on('message', msg => {
    // console.log(msg.text);
    // 如果用户有发文本，则将文本再发回给用户，做一个复读机
    if(msg.text) {
        // sendMessage方法第一个参数为用户id，第二个参数为要发的内容
        bot.sendMessage(msg.from.id, msg.text);
    }
});


/*
bot.onText(/\/start/, async msg => {
    try {
        await bot.sendMessage(msg.from.id, '查询天气，请回复【天气 你需要查询天气的地址】来获取天气信息')
    } catch (error) {
        console.log('/start', error);
    }
})
*/
