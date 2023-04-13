"use strict";
var uuid = require("node-uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "cargo_types",
      [
        {
          uuid: uuid(),
          name: "Livestock or Live Animals",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Humanitarian Aid and Relief",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Automotive",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Perishables",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Dangerous Goods",
          types: JSON.stringify([
            "Explosives",
            "Gases",
            "Flamable liquids",
            "Flamable Solids",
            "Oxidizing substances",
            "Toxic and Infectous Substances",
            "Radioactives",
            "Corrosives",
            "Other substances and Articles",
          ]),
        },
        {
          uuid: uuid(),
          name: "Pharmaceuticals",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Food stuffs",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Courier, Logistics and Supply chain",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Appliances and Furnitures",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "Hospital Equipment",
          types: JSON.stringify(["All"]),
        },
        {
          uuid: uuid(),
          name: "General Cargo",
          types: JSON.stringify([
            "Hair",
            "Cloths and Shoes",
            "Documents",
            "Cosmetics",
          ]),
        },
        {
          uuid: uuid(),
          name: "Others - Specify",
          types: JSON.stringify(["All"]),
        },
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("cargo_types", null, {});
  },
};

// 1. impliment user profile  --- deposite, transfer
// 2.
