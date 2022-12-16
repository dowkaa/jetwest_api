var Sequelize = require("sequelize");

var scheduledAudits = (sequelize: any, type: any) => {
  return sequelize.define("scheduled_audits", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    admin_id: Sequelize.STRING,
    flight_reg: Sequelize.STRING,
    activated_date: Sequelize.STRING,
    scheduled_date: Sequelize.STRING,
    upload_audit: Sequelize.STRING,
    observations: Sequelize.TEXT,
    description: Sequelize.STRING,
  });
};

module.exports = scheduledAudits;
