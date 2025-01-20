const jwtHelper = require('../Util/jwtHelper');
const appConfig = require('../config/jwt.json');
let baseResponse = require("../Util/baseResponse.js");
//const db = require('../models');
const User = require('../models/User');

class Middleware {
   /**
    * @param {Model} model The default model object
    * for the controller. Will be required to create
    * an instance of the controller
    */
    constructor() {
     // this._model = model;
     // this.create = this.create.bind(this);
    }

    authenticate = async (req, res, next) => {

            const response = new baseResponse(res);

            const Authorization = req.get('Authorization');

            let token = null;
            let result = null;
            if (Authorization) {
                token = Authorization.replace('Bearer ', '');
                try{
                    
                    result = await jwtHelper.isValid(token);

                    if(result){

                        const user = await User.findById(result.id);

                        if (!user) {
                            return response.sendResponse(null, false, "User not found!", 404);
                        }

                        req.session = user;
                        next();
                        

                    }else{
                         return response.sendResponse(null, false, "Access denied!", 403);
                    }


                }catch(e){

                   return response.sendResponse(null, false, e.message, 403);

                }
                
            }else{
                return response.sendResponse(null, false, "Access denied!", 403);
            }



          // console.log(Authorization)
    }
    hasRole = async (req, res, next, role = null) => {

            const response = new baseResponse(res);

            const user = req.session;
           
            try{
                
                
                if(role){
                    const userRoles = user.role.split(','); 
                    const hasRole = role.some(roleData => userRoles.includes(roleData));

                    if (hasRole) {

                        next();
                          
                    }else{
                        return response.sendResponse(null, false, "Access denied!", 403);
                    }
                }else{
                    return response.sendResponse(null, false, "Role not defined!", 403);
                }

            }catch(e){

               return response.sendResponse(null, false, e.message, 403);

            }


          // console.log(Authorization)
    }
    socketAuth = async (socket, next) => {

        if (socket.handshake.auth && socket.handshake.auth.token) {
            // Extract token from handshake and verify it
                const token = socket.handshake.auth.token;

                try{
                    
                    let result = await jwtHelper.isValid(token);


                    if(result){

                        const user = await UserModal.findOne({
                            where: {id: result.id}
                        });

                        if (!user) {
                             return next(new Error('Webscoket User not found'));
                        }

                        socket.user = user;
                        return next();
                        

                    }else{
                        return next(new Error('Webscoket Access denied'));
                    }


                }catch(e){

                    return next(new Error('Webscoket '+e.message));

                }
        } else {
            // No token provided, deny connection
            return next(new Error('Webscoket Authentication error'));
        }
    }
    
}

module.exports = Middleware;
/*
const send401 = (res) => {
    res.status(401)
    res.json()
}
const send403 = (res) => {
    res.status(403)
    res.json()
}

const authenticate = async (req, res, next) => {

    const Authorization = req.get('Authorization')
    let token = null;
    let result = null;
    if (Authorization) {
        token = Authorization.replace('Bearer ', '');
        try{
            
            result = await jwtHelper.decodeToken(token);

        }catch(e){
           send401(res);
           return

        }
        
    }


    if (null === token || result == null) {
        send401(res);
        return
    } else if (token == appConfig.superKey) {
        req.session = null;
        next();
    } else {
        var session = await accountController.getUserSession(token, req, res, next, send401);
    }


}

const isSuperAdmin = async (req, res, next) => {

	const { roleId } = req.session;
	const { superAdmin } = dbConstants.roles;

	if(roleId == superAdmin) {
		next();
	} else {
		send401(res);
	}
}

const isClubOwner = async (req, res, next) => {
	const { roleId } = req.session;
	const { clubOwner } = dbConstants.roles;

	if(roleId == clubOwner) {
		next();
	} else {
		send401(res);
	}
}
const isClubManager = async (req, res, next) => {
    const { roleId } = req.session;
    const { clubManager } = dbConstants.roles;

    if(roleId == clubManager) {
        next();
    } else {
        send401(res);
    }
}

const authenticateApp = async (req, res, next) => {
    const response = new appBaseResponse(res);
    const Authorization = req.get('Authorization')
    let token = null;
    let result = null;

    if (Authorization) {
        token = Authorization.replace('Bearer ', '');

        try{
            
            result = await jwtHelper.decodeToken(token);



        }catch(e){

           response.sendResponse(401, "Authetication failed", false, null);
           return

        }
        
    }

    if (null === token || result == null) {
        send401(res);
        return
    } else if (token == appConfig.superKey) {
        req.session = null;
        next();
    } else {
        var session = await appAccountController.getUserSession(token, req, res, next, send401);
    }

    
}
const isAppUser = async (req, res, next) => {
    const { roleId } = req.session;
    const { appUser } = dbConstants.roles;

    if(roleId == appUser) {
        next();
    } else {
        send401(res);
    }
}

module.exports = {
	authenticate,
	isSuperAdmin,
	isClubOwner,
    isClubManager,
    isAppUser,
    authenticateApp
}*/