export {};
import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const { Op } = require("sequelize");
const db = require("../database/mysql");
const { paginate } = require("paginate-info");

module.exports = {
  getDailyFlightSchedule: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { departure_airport, destination_airport } = req.query;

    if (!destination_airport && !destination_airport) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Kindly add a departure airport and a destination airport to your request"
          )
        );
    }

    let schedule_flights = await db.dbs.scheduleFlights.findAll({
      where: {
        departure_station: departure_airport,
        destination_station: destination_airport,
        order: [["createdAt", "DESC"]],
      },
    });

    return res.status(200).json({ schedule_flights });
  },
};
