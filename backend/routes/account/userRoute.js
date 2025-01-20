const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();
let UserController = new (require('../../controllers/userController.js'))();


router.post("/AddEditUser", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await UserController.AddEditUser(req.body,req.files,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getUsers", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await UserController.getUsers(req.query, res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getUserById/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await UserController.getUserById(req.params, res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/deleteUserById/:id", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await UserController.deleteUserById(req.params, res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.get("/getCrewMembers", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await UserController.getCrewMembers(req.query, res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

module.exports = router