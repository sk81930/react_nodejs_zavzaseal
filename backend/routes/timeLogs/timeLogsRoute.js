const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();
let timeLogsController = new (require('../../controllers/timeLogsController.js'))();


router.post("/addTimeLog", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await timeLogsController.addTimeLog(req.session,req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getTimeLogs", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await timeLogsController.getTimeLogs(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getLogsByUserId/:userId", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await timeLogsController.getLogsByUserId(req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getDateWiseLogs/:userId", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await timeLogsController.getDateWiseLogs(req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

module.exports = router