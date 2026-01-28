import * as SQLite from 'expo-sqlite';



/**

* DB接続を取得するヘルパー関数

* モダンなAPIでは openDatabaseAsync を使用します

*/

export const getDBConnection = async () => {

return await SQLite.openDatabaseAsync('household.db');

};



/**

* データベースの初期化処理

*/

export const initDB = async () => {

const db = await getDBConnection();



try {

// 1. テーブル作成

// execAsync は複数のSQL文を一度に実行できるため、初期化に最適です

await db.execAsync(`

PRAGMA foreign_keys = ON;



CREATE TABLE IF NOT EXISTS M_Category (

id TEXT PRIMARY KEY,

name TEXT NOT NULL,

color TEXT NOT NULL

);



CREATE TABLE IF NOT EXISTS M_Coin (

id TEXT PRIMARY KEY,

coin INTEGER NOT NULL

);



CREATE TABLE IF NOT EXISTS T_Household (

id TEXT PRIMARY KEY,

categoryId TEXT NOT NULL,

transactionName TEXT NOT NULL,

memo TEXT,

createdAt TEXT NOT NULL,

FOREIGN KEY (categoryId) REFERENCES M_Category (id)

);



CREATE TABLE IF NOT EXISTS T_HouseholdItem (

id TEXT PRIMARY KEY,

transactionId TEXT NOT NULL,

categoryId TEXT NOT NULL,

itemName TEXT,

amount INTEGER NOT NULL,

memo TEXT,

FOREIGN KEY (transactionId) REFERENCES T_Household (id) ON DELETE CASCADE,

FOREIGN KEY (categoryId) REFERENCES M_Category (id)

);

`);



// 2. 初期データの確認と投入 (Seeding)

// getFirstAsync は結果の最初の1行だけを返します

const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM M_Category');


if (result && result.count === 0) {

console.log('Seeding Master Data...');


// runAsync は結果を返さないクエリ（INSERT, UPDATE, DELETE）に使用します

await db.runAsync("INSERT INTO M_Category (id, name, color) VALUES (?, ?, ?)", 'C-01', '食費', '#FF5733');

await db.runAsync("INSERT INTO M_Category (id, name, color) VALUES (?, ?, ?)", 'C-02', '交通費', '#33C1FF');

await db.runAsync("INSERT INTO M_Category (id, name, color) VALUES (?, ?, ?)", 'C-03', '日用品', '#33FF57');



const coins = [1, 5, 10, 50, 100, 500, 1000, 5000, 10000];

for (const [index, val] of coins.entries()) {

await db.runAsync("INSERT INTO M_Coin (id, coin) VALUES (?, ?)", `COIN-${index}`, val);

}

}



console.log("DB Init Success");



} catch (error) {

console.error("DB Init Error: ", error);

throw error;

}

};