const tool = require("../utils/packages");

const schema = tool.Joi.Object().keys({
  data: tool.Joi.string().min(5).required(),
});

const decodeMiddleware = (req: any, res: any, next: any) => {
  const result = tool.Joi.validate(req.body, schema);

  if (result.error != null) {
    return res
      .status(400)
      .json(tool.helpers.sendError("Data field is required"));
  }

  var token = req.body.data;

  try {
    var decoded = tool.jwt_decode(token);
    req.body = decoded;
    next();
  } catch (e: any) {
    console.log({ e });
    return res.status(400).json(tool.helpers.sendError(e.message));
  }
};

module.exports = decodeMiddleware;
