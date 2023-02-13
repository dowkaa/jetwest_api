var Sequelize = require("sequelize");

var AuditLog = (sequelize: any, type: any) => {
  return sequelize.define("audit_logs", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.INTEGER,
    description: Sequelize.STRING,
    data: Sequelize.TEXT
  });
};

module.exports = AuditLog;
