const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();
let bitrixLeadsController = new (require('../../controllers/bitrixLeadsController.js'))();



router.get("/getLeadById/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.getLeadById(req.params,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getLeadsData", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.getLeadsData(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getSources", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.getSources(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.post("/addExpenses", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.addExpenses(req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getWebsiteData", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.getWebsiteData(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.post("/updateLeadFields", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.updateLeadFields(req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getReportFiltersData", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.getReportFiltersData(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getReports", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.getReports(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getReportsChartData", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await bitrixLeadsController.getReportsChartData(req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

module.exports = router