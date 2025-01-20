const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();
let callLogsController = new (require('../../controllers/callLogsController.js'))();




router.get("/getCallLogs", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await callLogsController.getCallLogs(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getCallLogsChartData", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await callLogsController.getCallLogsChartData(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getCallLogsToken", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await callLogsController.getCallLogsToken(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

module.exports = router