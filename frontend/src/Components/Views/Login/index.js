import React, { useEffect, useState, Fragment } from 'react';
import { connect } from "react-redux";
import agent from "../../../agent";

import { useNavigate } from "react-router-dom";

import {
	APP_LOAD,
  	LOGIN,
  	CLEAR_LOGIN_MESSAGE,
  	LOAD_APP_LOAD,
} from "../../../constants/actionTypes";


const mapStateToProps = (state) => ({
  	...state,
  	loginData: state.auth.loginData,
  	currentUser: state.auth.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
	onAppLoad: (payload, token) => dispatch({ type: APP_LOAD, payload, token, skipTracking: true }),
	onSubmit: (values) => {
    	dispatch({ type: LOGIN, payload: agent.Auth.login(values) });
  	},
  	clearData: () => {
    	dispatch({ type: CLEAR_LOGIN_MESSAGE });
  	},
  	loadAppLoad: (type) => {
    	dispatch({ type: LOAD_APP_LOAD, payload: type });
  	}
});



const MainView = (props) => {

	document.title = "Login";

	const navigate = useNavigate();

	const { currentUser, onSubmit, loginData, clearData, loadAppLoad, onAppLoad} = props;

	const [email, setEmail] = useState('');
	const [errorMsg, setErrorMsg] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);
	const [password, setPassword] = useState('');

	useEffect(() => {
	    if (loginData && loginData.message && loginData.isSuccess === false) {
	    	setErrorMsg(loginData.message);

	    }else if (loginData && loginData.message && loginData.isSuccess === true) {
	    	
            setSuccessMsg(loginData.message); 

            let token = null, _payload = null;
			if(localStorage.getItem('jwt')) {
				token = localStorage.getItem('jwt');
				agent.setToken(token);
		      	_payload = agent.Auth.current();
		    }
			onAppLoad(_payload, token);
			setTimeout(function(){
				clearData();
			},1000)
	    }else{
	    	setErrorMsg(null);
	    	setSuccessMsg(null);
	    }
  	}, [loginData, clearData, onAppLoad]);


  	useEffect(() => {
	    if (currentUser && currentUser.id) {
	    	loadAppLoad(false);
	    	setTimeout(function(){
                 loadAppLoad(true);
	    	},100)
	    	navigate('/dashboard');
	    }
  	}, [currentUser, loadAppLoad, navigate]);



	const submitForm = (e) => {
		e.preventDefault();
		clearData();
		onSubmit({ email, password });
	};


	return (
		<Fragment>
			<section className="bg-light py-3 py-md-5">
			  <div className="container">
			    <div className="row justify-content-center">
			      <div className="col-12 col-sm-12 col-md-9 col-lg-7 col-xl-6 col-xxl-5">
			        <div className="card border border-light-subtle rounded-3 shadow-sm mt-5">
			          <div className="card-body p-3 p-md-4 p-xl-5">
			            <div className="d-flex justify-content-center align-items-center mb-2">
			           		 <img src={require("../../../assets/images/zavza-logo.png")} className="img-fluid" alt="Wild Landscape" />
			            </div>
			            <h2 className="fs-6 fw-normal text-center text-secondary mb-4">Sign in to your account</h2>
			            <form onSubmit={submitForm}>
			                {errorMsg ? 
			                  <div className="alert alert-danger" role="alert">{errorMsg}</div>
			                : <Fragment /> }
			                {successMsg ? 
			                  <div className="alert alert-success" role="alert">{successMsg}</div>
			                : <Fragment /> }
			                

			              <div className="row gy-2 overflow-hidden">
			                <div className="col-12">
			                  <div className="form-floating mb-3">
			                    <input 
			                        type="email" 
			                        className={`form-control ${errorMsg ? 'is-invalid' : ''}`}
			                        value={email}
			                   		onChange={(e) => setEmail(e.target.value)}
			                   		placeholder="Email Address"
			                        required 
			                    />
			                    <label className="form-label">Email Address</label>
			                  </div>
			                </div>
			                <div className="col-12">
			                  <div className="form-floating mb-3">
			                    <input 
			                        type="password" 
			                        className={`form-control ${errorMsg ? 'is-invalid' : ''}`}
			                        value={password}
				                    onChange={(e) => setPassword(e.target.value)}
				                    placeholder="Password"
				                    required 
				                />
			                    <label className="form-label">Password</label>
			                  </div>
			                </div>
			                <div className="col-12">
			                  <div className="d-flex gap-2 justify-content-between">
			                    <div className="form-check">
			                      <input className="form-check-input" type="checkbox" value="" name="rememberMe" id="rememberMe" />
			                      <label className="form-check-label text-secondary" >
			                        Keep me logged in
			                      </label>
			                    </div>
			                  </div>
			                </div>
			                <div className="col-12">
			                  <div className="d-grid my-3">
			                    <button className="btn btn-primary btn-lg" type="submit">Login</button>
			                  </div>
			                </div>
			              </div>
			            </form>
			          </div>
			        </div>
			      </div>
			    </div>
			  </div>
			</section>
		</Fragment>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);