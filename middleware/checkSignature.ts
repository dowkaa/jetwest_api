const utillz = require("../utils/packages");

const signatures = (time: any) => {
  var sign = utillz.cryptoJS.enc.Utf8.parse(time);

  var hash = utillz.cryptoJS.HmacSHA256(sign, process.env.SECRET);
  return hash.toString(utillz.cryptoJS.enc.Hex);
};

const signatureMiddleware = (req: any, res: any, next: any) => {
  const hasValue = req.headers.hasOwnProperty("signatures");

  if (!hasValue) {
    return res
      .status(400)
      .json(utillz.helpers.sendError("Signatures header is required"));
  }

  var time1 = utillz.helpers.timestamp();
  var time2 = time1 + 1;

  var serverSignature1 = signatures(time1);
  var serverSignature2 = signatures(time2);
  var clientSignature = req.headers.signatures;

  if (
    !(
      serverSignature1 != clientSignature || serverSignature2 != clientSignature
    )
  ) {
    return res.status(400).json(utillz.helpers.sendError("Request not signed"));
  }

  next();
};

module.exports = signatureMiddleware;
