var Sequelize = require("sequelize");

var Cargos = (sequelize: any, type: any) => {
  return sequelize.define("cargos", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    owner_id: Sequelize.STRING,
    model: Sequelize.STRING,
    payload: Sequelize.STRING,
    areasOfCoverage: Sequelize.STRING,
    monthly_flight_time: Sequelize.STRING,
    weekly_flight_time: Sequelize.STRING,
    daily_flight_time: Sequelize.STRING,
    aircraft_registration: Sequelize.STRING,
    airworthiness_cert_url: Sequelize.STRING,
    airworthiness_cert_exp_date: Sequelize.STRING,
    noise_cert_url: Sequelize.STRING,
    noise_cert_exp_date: Sequelize.STRING,
    insurance_cert_url: Sequelize.STRING,
    insurance_cert_exp_date: Sequelize.STRING,
    registration_cert_url: Sequelize.STRING,
    registration_cert_exp_date: Sequelize.STRING,
    maintenance_program_url: Sequelize.STRING,
    mmel: Sequelize.STRING,
    ops_manual: Sequelize.STRING,
    status: Sequelize.STRING,
  });
};

module.exports = Cargos;
