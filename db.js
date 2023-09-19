import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('mysql');
require('dotenv').config();
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_DATABASE
});

// 导出数据库连接
export { connection };

export const users = `
  CREATE TABLE IF NOT EXISTS users (
    tg_id VARCHAR(16) NOT NULL,
    tg_name VARCHAR(32),
    wallet_connected BOOLEAN,
    wallet_addr VARCHAR(64),
    createAt DATE,
    updatedAt DATE,
    
    PRIMARY KEY (tg_id)
  );
`;

export const players = `
  CREATE TABLE IF NOT EXISTS players (
    telegram_id BIGINT NOT NULL,
    player_name VARCHAR(32),
    role VARCHAR(32),
    level INT,
    exp INT,
    gold BIGINT,  
    ranking INT,
    cur_action_point INT,
    max_action_point INT,
    cur_hp INT,
    max_hp INT,
    cur_attack INT,
    max_attack INT,
    cur_defense INT,
    max_defense INT,
    cur_agility INT,
    max_agility INT,
    luck INT,  
    fire_atk INT,
    ice_atk INT,
    poison_atk INT,
    thunder_atk INT,
    fire_resist INT,
    ice_resist INT,
    poison_resist INT,
    thunder_resist INT,
    revival_coin_count INT,
    equipped_weapon INT,
    equipped_armor INT,
    status INT,
    
    PRIMARY KEY (telegram_id),
    INDEX idx_ranking (ranking)
  );
`;

export const roles = `
  CREATE TABLE IF NOT EXISTS roles (
    role_id INT NOT NULL,
    role_name VARCHAR(32),
    base_hp INT,
    base_attack INT,
    base_defense INT,
    base_agility INT, 
    base_luck INT, 
    
    PRIMARY KEY (role_id)
  );
`;

export const monsters = `
  CREATE TABLE IF NOT EXISTS monsters (
    monster_id INT NOT NULL,
    monster_name VARCHAR(32),
    monster_race VARCHAR(32),
    base_hp INT,
    base_attack INT,
    base_defense INT,  
    base_agility INT,
    fire_atk INT,
    ice_atk INT,
    poison_atk INT,
    thunder_atk INT,
    fire_resist INT,
    ice_resist INT,
    poison_resist INT,
    thunder_resist INT,
    
    PRIMARY KEY (monster_id)
  );
`;

// 连接数据库
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('DB has connected to the MySQL server.');
}
);

// 使用表结构变量创建表
connection.query(players, (err, result) => {
  if (err) throw err;
  console.log('Player table created!');
});

// 创建 roles 表  
connection.query(roles, (err, result) => {
  if (err) throw err;
  console.log("Roles table created");
});

// 创建 monsters 表
connection.query(monsters, (err, result) => {
  if (err) throw err;
  console.log("Monsters table created"); 
});

// 创建 monsters 表
connection.query(users, (err, result) => {
  if (err) throw err;
  console.log("Users table created"); 
});
