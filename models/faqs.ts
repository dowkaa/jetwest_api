var Sequelize = require("sequelize");

var Faqs = (sequelize: any, type: any) => {
  return sequelize.define("faqs", {
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

module.exports = Faqs;
