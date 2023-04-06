// const express = require('express');
export {};
require("dotenv").config();
require("./database/mysql");
const utils = require("./utils/packages");
const port = process.env.PORT;

// https://stackoverflow.com/questions/41194368/how-to-get-all-sundays-mondays-tuesdays-between-two-dates

// const publicRoute = require('./routes/public')
const server = require("./utils/server");
const app = server.createServer();
const http = require("http").Server(app);

module.exports = http.listen(port || 2023, () => {
  console.log(`Server started on port ${port}`);
  // let date = utils.moment().add(1, "hour").format("YYYY-MM-DD HH:mm:ss");

  const getDailyWeeklyDate = async (option: any) => {
    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
  };

  function monthDiff(d1: string, d2: string) {
    let date1 = new Date(d1);
    let date2 = new Date(d2);
    var months;
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
    return months <= 0 ? 0 : months;
  }

  // let m = monthDiff("2023-01-01", "2023-04-31");
  // let startYear = utils.moment("2023-01-01").format("YYYY");
  // let startMonth = utils.moment("2023-01-01").format("MM");
  // let endMonth = utils.moment("2023-04-30").format("MM");
  // let endYear = utils.moment("2023-04-30").format("YYYY");
  // let yearsDiff = endYear - startYear;

  // console.log({ m, yearsDiff, startYear, startMonth, endYear, endMonth });

  // const getMonthlyDate = async (option: any) => {
  //   function monthDiff(d1: string, d2: string) {
  //     let date1 = new Date(d1);
  //     let date2 = new Date(d2);
  //     var months;
  //     months = (date2.getFullYear() - date1.getFullYear()) * 12;
  //     months -= date1.getMonth();
  //     months += date2.getMonth();
  //     return months <= 0 ? 0 : months;
  //   }

  //   let m = monthDiff(option.startDate, option.end_date);
  //   let startYear = utils.moment(option.startDate).format("YYYY");
  //   let startMonth = utils.moment(option.startDate).format("MM");
  //   let endMonth = utils.moment(option.end_date).format("MM");
  //   let endYear = utils.moment(option.end_date).format("YYYY");
  //   let endDate = utils.moment(option.end_date).format("YYYY-MM-DD");
  //   let yearsDiff = endYear - startYear;

  //   // console.log({ yearsDiff, m, option });

  //   let c;
  //   let arr = [];
  //   let arr2 = [];
  //   let arr3 = [];

  //   for (let i = 0; i < option.dayNums.length; i++) {
  //     c = utils.moment(option.dayNums[i]).format("YYYY-MM-DD");
  //     if (utils.moment(option.dayNums[i]).isValid()) {
  //       arr.push(c);
  //     }

  //     // console.log({ opt: option.dayNums[i] });
  //   }
  //   arr2.push(...arr);

  //   for (let i = 0; i < arr.length; i++) {
  //     for (let j = 1; j <= m; j++) {
  //       // if (
  //       //   utils.moment(arr[i]).add(j, "months").format("YYYY-MM-DD") < endDate
  //       // )
  //       arr2.push(utils.moment(arr[i]).add(j, "months").format("YYYY-MM-DD"));
  //     }
  //   }

  //   arr3.push(...arr2);
  //   console.log({ arr3 });
  //   let count = 0;
  //   let arr4 = [];
  //   for (let i = 1; i < 31; i++) {
  //     let a = 1;
  //     count += 7;
  //     let c = utils
  //       .moment("2023-01-05")
  //       .add(count, "days")
  //       .format("YYYY-MM-DD");

  //     if (parseInt(utils.moment(c).format("MM")) === 1) {
  //       arr4.push(c);
  //     }

  //     // for (let j = 1; j <= 31; j++) {
  //     //   arr2.push(utils.moment(arr2[i]).add(j, "days").format("YYYY-MM-DD"));
  //     // }
  //   }

  //   console.log({ arr4 });

  //   return arr;

  //   // console.log({ arr, arr2 });

  //   // let count = 0;
  //   // let arr = [];
  //   // let c;
  //   // for (var i = 0; i <= m; i++) {
  //   //   count++;
  //   //   c = startYear + "-" + (parseInt(startMonth) + count);
  //   //   for (let j = 1; j <= parseInt(endYear) - parseInt(startYear) + 1; j++) {
  //   //     if (parseInt(startYear) <= parseInt(endYear)) {
  //   //       c = parseInt(startYear) + (j - 1) + "-" + count;
  //   //       if (utils.moment(c).isValid()) {
  //   //         arr.push(utils.moment(c).format("YYYY-MM"));
  //   //       }
  //   //     }
  //   //   }
  //   // }
  //   // let arr4 = [];
  //   // var mv;
  //   // for (let i = 0; i < option.dayNums.length; i++) {
  //   //   mv = option.dayNums[i];

  //   //   for (let j = 0; j < arr.length; j++) {
  //   //     let r = arr[j] + "-" + mv;
  //   //     r = utils.moment(r).format("YYYY-MM-DD");
  //   //     if (utils.moment(r).isValid()) {
  //   //       arr4.push(r);
  //   //     }
  //   //   }
  //   // }

  //   // let v = [];

  //   // for (var k = 0; k < 31; k++) {
  //   //   for (var l = 0; l < arr4.length; l++) {
  //   //     utils.moment(arr4[l]).add(7, "days").format("YYYY-MM-DD");
  //   //     if (utils.moment(arr4[l]).add(7, "days").isValid()) {
  //   //       v.push(utils.moment(arr4[l]).add(7, "days").format("YYYY-MM-DD"));
  //   //     }
  //   //   }
  //   // }

  //   // console.log({ v });
  // };

  // const options = {
  //   startDate: "2023-01-05",
  //   end_date: "2023-02-01",
  //   dayNums: ["2023-01-05", "2023-01-07", "2023-01-09"],
  // };
  // let arr = getMonthlyDate(options);

  // console.log({ arr });

  function getDatesOnDaysOfWeek(...daysOfWeek: any) {
    const result = [];

    const startDate = new Date("2023-04-01");
    const endDate = new Date("2023-05-31");

    while (startDate <= endDate) {
      if (daysOfWeek.includes(startDate.getDay())) {
        result.push(utils.moment(new Date(startDate)).format("YYYY-MM-DD"));
      }
      startDate.setDate(startDate.getDate() + 1);
    }

    return result;
  }

  const selectedDays = getDatesOnDaysOfWeek(1, 3, 4, 6);

  // console.log({ selectedDays });

  // const lastDays = [];

  // var month = 0;
  // var year = 0;

  // while (year <= 2026 && month <= 11) {
  //   let first = new Date();
  // }
});
