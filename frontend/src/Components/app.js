import React, { Suspense, Fragment, useEffect, useState} from "react";
import { connect } from "react-redux";
import {useNavigate,useLocation } from 'react-router-dom';
import '../assets/mdb/src/mdb/scss/mdb.pro.scss';
import "@fortawesome/fontawesome-free/css/all.min.css";

import {BaseRoute,SuperAdminRoute,AdminRoute,CrewRoute,OperationsRoute,EstimatorRoute} from './UserRoutes';
import agent from "../agent";

import {
  	APP_LOAD,
  	CLEAR_LOGOUT,
  	LOGOUT
} from "../constants/actionTypes";

const mapStateToProps = (state) => {
	return {
		...state,
		appLoaded: state.auth.appLoaded,
		currentUser: state.auth.currentUser,
		logoutRedirectTo: state.auth.logoutRedirectTo,
	}
};

const mapDispatchToProps = (dispatch) => ({
	onAppLoad: (payload, token) => dispatch({ type: APP_LOAD, payload, token, skipTracking: true }),
	onSignOut: () => { dispatch({ type: LOGOUT }) },
	onLogoutClear: () => { dispatch({ type: CLEAR_LOGOUT }) },
});

const AppComponent = (props) => {


	const { appLoaded, currentUser, onSignOut, onLogoutClear, onAppLoad, logoutRedirectTo } = props;

	const location = useLocation();
	const { pathname } = location;

	const [userRoles, setUserRoles] = useState([]);

    

	
	let navigate = useNavigate();
	const routerProps = {
		currentUser
	}

	useEffect(() => {
		let token = null, _payload = null;

		if(localStorage.getItem('jwt')) {
			token = localStorage.getItem('jwt');
			agent.setToken(token);
	      	_payload = agent.Auth.current();
	    }
		onAppLoad(_payload, token);
	}, [onAppLoad]);

	


    useEffect(() => {
	    if (logoutRedirectTo) {
	    	onLogoutClear();
	    	navigate('/');
	    }
  	}, [logoutRedirectTo, navigate, onLogoutClear]);

  	useEffect(() => {
	    if (appLoaded) {
	    	

		    if(pathname.includes("/logout")){
		        onSignOut();
		    }
	    }
  	}, [appLoaded, onSignOut, pathname]);

  	useEffect(() => {
	    if (currentUser && currentUser.role) {

	    	const userRoles = currentUser.role.split(','); 

	    	setUserRoles(userRoles);
	    	
	    }
  	}, [currentUser]);

  	


	return (
    	<div className="main-body">
    	    {appLoaded ? (
				<Fragment>
	    	    	{(currentUser && currentUser.role && userRoles && userRoles.includes("super_admin")) ? (
						<Suspense fallback={null}>
					    	<SuperAdminRoute {...routerProps} />
			      		</Suspense>
			      	):(currentUser && currentUser.role && userRoles && userRoles.includes("admin")) ? (
						<Suspense fallback={null}>
					    	<AdminRoute {...routerProps} />
			      		</Suspense>
			      	):(currentUser && currentUser.role && userRoles && userRoles.includes("crew")) ? (
						<Suspense fallback={null}>
					    	<CrewRoute {...routerProps} />
			      		</Suspense>
			      	):(currentUser && currentUser.role && userRoles && userRoles.includes("operations")) ? (
						<Suspense fallback={null}>
					    	<OperationsRoute {...routerProps} />
			      		</Suspense>
			      	):(currentUser && currentUser.role && userRoles && userRoles.includes("estimator")) ? (
						<Suspense fallback={null}>
					    	<EstimatorRoute {...routerProps} />
			      		</Suspense>
			      	): (
				      	<Suspense fallback={null}>
					    	<BaseRoute {...routerProps} />
			      		</Suspense>	
			        )}
			      	
		      	</Fragment>
    		) : (
    			<div className="d-flex vh-100 align-items-center justify-content-center" style={{ color: '#2b8ebf'}}>
    			    <div className="spinner-grow" style={{width: '3rem', height: '3rem'}} role="status">
					  <span className="visually-hidden">Loading...</span>
					</div>
    			</div>
    		)}
    	</div>
  	);
};


export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);