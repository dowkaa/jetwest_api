var Sequelize = require("sequelize");

var Webhook = (sequelize: any, type: any) => {
  return sequelize.define("webhooks", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ip: Sequelize.STRING,
    type: Sequelize.STRING,
    body: Sequelize.TEXT,
  });
};

module.exports = Webhook;
