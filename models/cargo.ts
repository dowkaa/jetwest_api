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
    capacity: Sequelize.DOUBLE,
    available_capacity: Sequelize.DOUBLE,
    take_off: Sequelize.STRING,
    geo_coverage: Sequelize.STRING,
    monthly_flight_time: Sequelize.STRING,
    is_available: Sequelize.STRING,
    airworthiness_type: Sequelize.STRING,
    airworthiness_make: Sequelize.STRING,
    airworthiness_model: Sequelize.STRING,
    airworthiness_cert_url: Sequelize.STRING,
    aircraft_registration: Sequelize.STRING,
    airworthiness_cert_exp_date: Sequelize.STRING,
    noise_cert_url: Sequelize.STRING,
    noise_cert_exp_date: Sequelize.STRING,
    insurance_cert_url: Sequelize.STRING,
    insurance_cert_exp_date: Sequelize.STRING,
    registration_cert: Sequelize.STRING,
    registration_cert_exp_date: Sequelize.STRING,
    mmel: Sequelize.STRING,
    ops_manual: Sequelize.STRING,
  });
};

module.exports = Cargos;
