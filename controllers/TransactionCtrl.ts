var exec = require("child_process").exec;
import { Request, Response, NextFunction } from "express";

module.exports = {
  checkTransaction: async (req: any, res: Response, next: NextFunction) => {
    let data = {
      name: "Abel",
      date: "Hello world",
      first_name: "Abel",
    };
    var child = await exec(
      `java -jar Klasha/Klasha.jar ${JSON.stringify(data)}`,
      async function (error: any, stdout: any, stderr: any) {
        console.log({ error, stdout, stderr });

        return stdout;
      }
    );

    console.log({ child });
  },
};
