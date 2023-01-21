const packages = require("./packages");
function createServer() {
  const app = packages.express();

  // cross origin middleware
  app.use(packages.cors());

  // set security HTTP headers
  app.use(packages.helmet());

  // session
  app.use(packages.cookieParser());
  app.use(
    packages.session({
      secret: process.env.SECRET,
      resave: true,
      saveUninitialized: false,
      cookie: { maxAge: 600000 },
    })
  );

  var Queue = require("bull");
  const { createBullBoard } = require("bull-board");
  const { BullAdapter } = require("bull-board/bullAdapter");
  const updateUserBalance = new Queue("update-users-balance");
  const getUsers = new Queue("initialize");
  const updateSchedule = new Queue("update_schedule");
  const transactionValidate = new Queue("transaction_validate");
  const firstSchedule = new Queue("first_schedule");
  const allShipments = new Queue("all-shipments");
  const updateShipment = new Queue("update_shipment");
  const firstMail = new Queue("first_mail");
  const secondMail = new Queue("second_mail");

  const { router, setQueues, replaceQueues, addQueue, removeQueue } =
    createBullBoard([
      new BullAdapter(updateUserBalance),
      new BullAdapter(firstMail),
      new BullAdapter(firstSchedule),
      new BullAdapter(updateShipment),
      new BullAdapter(allShipments),
      new BullAdapter(transactionValidate),
      new BullAdapter(updateSchedule),
      new BullAdapter(secondMail),
    ]);

  //card-queue
  app.use("/admin/queues", router);

  setTimeout(() => {
    const option = {};
    // packages.initialize.processJob(option);
  }, 2000);

  setInterval(() => {
    const option = {};
    packages.scheduleItem.processJob(option);
  }, 60000);

  app.use(packages.bodyParser.urlencoded({ extended: true }));
  app.use(packages.bodyParser.json());

  app.use("/api/jetwest/public/", packages.publicRoute);
  app.use("/api/jetwest/password/", packages.password);
  app.use("/api/jetwest/webhook/", packages.Webhook);
  app.use("/api/jetwest/carriers/", packages.carriers);
  app.use("/api/jetwest/admin/", packages.admin);
  app.use("/api/jetwest/transactions/", packages.transactions);
  app.use("/api/jetwest/auth/", packages.authRouth);

  app.use(packages.passport.initialize());

  app.use((req: any, res: any, next: any) => {
    res.header("Acces-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method == "OPTIONS") {
      req.header(
        "Access-Control-Allow-Methods",
        "PUT, POST, DELETE, PATCH, GET"
      );
      return res.status(200).json({});
    }

    next();
  });

  app.use((error: any, req: any, res: any, next: any) => {
    if (error.message == "Unathorized from server") {
      return res
        .status(401)
        .json(packages.helpers.sendError("Email does not exist"));
    }

    res.status(error.status || 500);
    res.json({
      error: {
        status: "ERROR",
        message: error.message,
      },
    });
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    let errCode, errMessage;

    if (err.errors) {
      errCode = 400;
      const keys = Object.keys(err.errors);
      errMessage = err.errors[keys[0]].message;
    } else {
      errCode = err.status || 500;
      errMessage = err.message || "Internal Server Error";
    }

    res.status(errCode).type("txt").send(errMessage);
  });

  // Landing page
  app.use("/", (req: any, res: any, next: any) => {
    res.status(200).json({ success: true });
  });

  return app;
}

module.exports = { createServer };
