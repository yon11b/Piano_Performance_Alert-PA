// app/lib/models/index.ts
import { Sequelize } from "sequelize";
import mysql2 from "mysql2";
import PerformanceModel from "./performance";

const sequelize = new Sequelize(
  process.env.DB_NAME ?? "pa",
  process.env.DB_USER ?? "pa",
  process.env.DB_PASSWORD ?? "1234",
  {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: "mysql",
    dialectModule: mysql2,
  }
);

const db: { [key: string]: any } = {};

// 모델 초기화
db.Performance = PerformanceModel.initModel(sequelize);

// 관계 설정 (associate가 있다면)
Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
