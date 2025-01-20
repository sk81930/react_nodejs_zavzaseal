const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();

let authController = new (require('../../controllers/authController.js'))();


// let userControllerClass = require('../../controllers/userController.js');

// let UserController = new userControllerClass;


router.post("/login", async (req, res) => {
   const response = new baseResponse(res);
   try {
      let result = await authController.login(req.body, res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});


router.get("/user", Middleware.authenticate, (req, res) => {

   const response = new baseResponse(res);
   try {
      let data = {
         user : req.session
      }
     return response.sendResponse(data, true, "User data!", 200);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.post("/updateProfile", Middleware.authenticate, async (req, res) => {

   const response = new baseResponse(res);
   try {
      let result = await authController.updateProfile(req.session, req, res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

// router.post("/updateProfile", Middleware.authenticate, async (req, res) => {
   
//    const response = new baseResponse(res);
//    try {
//       let result = await authController.updateProfile(req.session, req, res);
//    } catch(err) {
//       response.sendResponse([], false, err.message, 201);
//    }
// });
// router.get("/getUserRole", Middleware.authenticate, (req, res, next) => {
//   Middleware.hasRole(req, res, next, ['admin','manager']);
// }, async (req,res) => { 
//    const response = new baseResponse(res);
//    try {
//      let result = await UserController.getUserRole(req.query, res);
//    } catch(err) {
//       response.sendResponse([], false, err.message, 201);
//    }
// });


module.exports = router