var Sequelize = require("sequelize");

var AircraftAuditLog = (sequelize: any, type: any) => {
  return sequelize.define("aircraft_audit_logs", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    user_id: Sequelize.STRING,
    flight_reg: Sequelize.STRING,
    activated_date: Sequelize.STRING,
    scheduled_date: Sequelize.STRING,
    report_url: Sequelize.STRING,
    description: Sequelize.TEXT,
  });
};

module.exports = AircraftAuditLog;
