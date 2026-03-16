const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware/index.js'))();
let estimateController = new (require('../../controllers/estimateController.js'))();




router.post("/createTemplate", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.createTemplate(req.session,req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getTemplates", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.getTemplates(req.session,req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getTemplateById/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.getTemplateById(req.session,req.params,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getLeadsBySearch", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.getLeadsBySearch(req.session,req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.post("/updateTemplate/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.updateTemplate(req.session,req.params,req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.post("/deleteTemplate/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.deleteTemplate(req.session,req.params,req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.post("/deleteEstimate/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.deleteEstimate(req.session,req.params,req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getEstimatesData", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.getEstimatesData(req.session,req.query,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.post("/createEstimate", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.createEstimate(req.session,req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.post("/updateEstimate/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.updateEstimate(req.session,req.params,req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getEstimateById/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.getEstimateById(req.session,req.params,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/downloadPDF/:id", Middleware.authenticate, (req, res, next) => {
   Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.downloadPDF(req.session,req.params,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/downloadPDF2/:id", async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.downloadPDF(req.session,req.params,res);
   } catch(err) {
      //response.sendResponse([], false, err.message, 201);
   }
});
router.get("/viewPDF/:id", Middleware.authenticate, (req, res, next) => {
   Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.viewPDF(req.session,req.params,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/sendToXero/:id", Middleware.authenticate, (req, res, next) => {
   Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.sendToXero(req.session,req.params,res);
   } catch(err) {
      console.error('Error sending estimate to Xero:', err);
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/xero_callback",  async (req, res) => {

   const response = new baseResponse(res);
   try {
     let result = await estimateController.xero_callback(req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.post("/sendEstimateEmail", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin','crew']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await estimateController.sendEstimateEmail(req.session,req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});


module.exports = router