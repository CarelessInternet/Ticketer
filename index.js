require('dotenv').config();

const {ShardingManager} = require('discord.js');
const dateFormat = require('dateformat');
const token = process.env.token;

const manager = new ShardingManager('./bot.js', {token: token});
manager.on('shardCreate', shard => console.log(`Created shard #${shard.id} at ${dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')}`));

if (process.env['NODE_ENV'] === 'production') {
  const {AutoPoster} = require('topgg-autoposter');
  const topGGToken = process.env.topGGToken;
  const poster = AutoPoster(topGGToken, manager);
  
  poster.on('error', console.error);
}

manager.spawn();