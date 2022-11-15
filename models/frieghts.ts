var Sequelize = require("sequelize");

var Frieghts = (sequelize: any, type: any) => {
  return sequelize.define("frieghts", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    type: Sequelize.STRING,
    title: Sequelize.STRING,
    question: Sequelize.STRING,
  });
};

module.exports = Frieghts;
