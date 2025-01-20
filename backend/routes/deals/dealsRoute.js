const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();
let bitrixDealsController = new (require('../../controllers/bitrixDealsController.js'))();




router.get("/getDeals", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixDealsController.getDeals(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

module.exports = router