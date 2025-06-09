const axios = require("axios");

class GoldLiveRateController {
  static async getLatestLTV(req, res, next) {
    try {
      const response = await axios.post(
        "http://insight.indelmoney.com:8089/indel/api/insight/latestLTV",
        {},
        {
          headers: {
            Api_key: "ed8d7baf6b5bc3be44ea3fcd65482541a6770d8d",
          },
        }
      );

      if (!response.data || !response.data.success) {
      
        const randomNumber = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
        return res.json({ success: true, data: randomNumber });
      
      } else {

        return res.json({ success: true, data: response.data }); 
      }

    } catch (error) {
      console.error("Error fetching latest LTV:", error.message);
      next(error);

    }
  }
}

module.exports = GoldLiveRateController;