const axios = require("axios");
const CustomError = require("../../utils/customError");

class GoldRateController {
  static async fetchGoldRate(req, res, next) {
    try {
      const { data } = await axios.post(
        "http://insight.indelmoney.com:8089/indel/api/insight/latestLTV",
        {},
        {
          headers: {
            Api_key: "ed8d7baf6b5bc3be44ea3fcd65482541a6770d8d",
          },
        }
      );

      if (data?.status && data?.LTV) {
        res.status(200).json({ success: true, goldRate: parseFloat(data.LTV) });
      } else {
        throw new CustomError("Failed to fetch gold rate", 502);
      }
    } catch (error) {
      next(error); // Uses your centralized error handler
    }
  }
}

module.exports = GoldRateController;
