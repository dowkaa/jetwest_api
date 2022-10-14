var Sequelize = require("sequelize");

var Testimonial = (sequelize: any, type: any) => {
  return sequelize.define("testimonials", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: Sequelize.STRING,
    image_url: Sequelize.STRING,
    fullname: Sequelize.STRING,
    remarks: Sequelize.STRING,
    role: Sequelize.STRING,
    company: Sequelize.STRING,
  });
};

module.exports = Testimonial;
