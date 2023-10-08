import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('mysql');
require('dotenv').config();
/*
const dbpool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_DATABASE
});
*/

const connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  port     : process.env.DB_PORT,
  user     : process.env.DB_USER,
  password : process.env.DB_PW,
  database : process.env.DB_DATABASE
}); 

// 导出数据库连接
// export { dbpool };

export const users = `
  CREATE TABLE IF NOT EXISTS users (
    tg_id VARCHAR(16) NOT NULL,
    tg_name VARCHAR(32),
    wallet_connected BOOLEAN,
    wallet_addr VARCHAR(64),
    first_time TIMESTAMP NOT NULL,
    is_created BOOLEAN, 
    
    PRIMARY KEY (tg_id)
  );
`;

export const players = `
  CREATE TABLE IF NOT EXISTS players (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tg_id VARCHAR(16) NOT NULL,
    name VARCHAR(32) NOT NULL,
    gold BIGINT NOT NULL,  
    ranking INT,
    ranking_points BIGINT NOT NULL,
    monster_counts INT NOT NULL,
    events_counts INT NOT NULL,
    cur_action_points INT,
    max_action_points INT,
    cur_hp INT,
    max_hp INT,
    cur_attack INT,
    max_attack INT,
    cur_defense INT,
    max_defense INT,
    cur_agility INT,
    fire_atk INT,
    ice_atk INT,
    poison_atk INT,
    thunder_atk INT,
    fire_resist INT,
    ice_resist INT,
    poison_resist INT,
    thunder_resist INT,
    health_potion_count INT NOT NULL,
    action_potion_count INT NOT NULL,
    equipped_weapon INT,
    equipped_armor INT,
    status INT
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

connection.query(users, (error) => {
  if (error) {
    console.error('Error creating table users:', error);
  } else {
    console.log('Table users created successfully.');
  }
});

connection.query(players, (error) => {
  if (error) {
    console.error('Error creating table players:', error);
  } else {
    console.log('Table players created successfully.');
  }
});

connection.query(monsters, (error) => {
  if (error) {
    console.error('Error creating table monsters:', error);
  } else {
    console.log('Table monsters created successfully.');
  }
});

export {connection};

/*
// 连接数据库
dbpool.getConnection((err, connection) => {
  if (err) {
    console.log('connection failed');
  } 
  else {
    console.log('connection success');
    // 使用表结构变量创建表
    dbpool.query(players, (err, result) => {
      if (err) throw err;
      console.log('Player table created!');
    });

    // 创建 monsters 表
    dbpool.query(monsters, (err, result) => {
      if (err) throw err;
      console.log("Monsters table created"); 
    });

    // 创建 monsters 表
    dbpool.query(users, (err, result) => {
      if (err) throw err;
      console.log("Users table created"); 
    });
    
    connection.destroy();
  }
})
*/
