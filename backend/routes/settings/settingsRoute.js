const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();
let settingsController = new (require('../../controllers/settingsController.js'))();


router.post("/addEditSettings", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await settingsController.addEditSettings(req.session,req.body,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getSettings", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await settingsController.getSettings(req.session,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

module.exports = router