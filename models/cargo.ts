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
    flight_reg: Sequelize.STRING,
    aircraft_registration: Sequelize.STRING,
    airworthiness_cert_url: Sequelize.STRING,
    airworthiness_cert_checked: Sequelize.BOOLEAN,
    airworthiness_cert_exp_date: Sequelize.STRING,
    noise_cert_url: Sequelize.STRING,
    noise_cert_exp_date: Sequelize.STRING,
    noise_cert_checked: Sequelize.BOOLEAN,
    insurance_cert_url: Sequelize.STRING,
    insurance_cert_exp_date: Sequelize.STRING,
    insurance_cert_checked: Sequelize.BOOLEAN,
    registration_cert_url: Sequelize.STRING,
    registration_cert_exp_date: Sequelize.STRING,
    registration_cert_checked: Sequelize.BOOLEAN,
    maintenance_program_url: Sequelize.STRING,
    maintenance_program_checked: Sequelize.BOOLEAN,
    mmel: Sequelize.STRING,
    mmel_checked: Sequelize.BOOLEAN,
    ops_manual: Sequelize.STRING,
    ops_manual_checked: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    note: Sequelize.TEXT,

    aircraft_type_checked: Sequelize.BOOLEAN,
    payload_checked: Sequelize.BOOLEAN,
    ops_spec_checked: Sequelize.BOOLEAN,
    flight_hrs_checked: Sequelize.BOOLEAN,
    aircraft_registration_checked: Sequelize.BOOLEAN,
    airworthiness_cert_exp_checked: Sequelize.BOOLEAN,
    noise_cert_exp_checked: Sequelize.BOOLEAN,
    insurance_cert_exp_checked: Sequelize.BOOLEAN,
    registration_cert_exp_checked: Sequelize.BOOLEAN,

    noteOne: Sequelize.TEXT,
    driveLink: Sequelize.STRING,
    noteTwo: Sequelize.BOOLEAN,
  });
};

module.exports = Cargos;
