import React, { Fragment } from 'react';
import { connect } from "react-redux";
import { Routes, Route } from 'react-router-dom';
import { baseRoutes} from './route';

import Login from "../Views/Login";

import {
    APP_LOAD,
    CLEAR_LOGOUT,
    LOGOUT
} from "../../constants/actionTypes";

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

const BaseRoute = (props) => {
    const { currentUser } = props;


  return (
    <Fragment>
        <Routes>
                <Fragment>
                
                    {baseRoutes.map((route, i) => {
                        let component = route.component;
                        return (
                            <Route
                                key={i}
                                {...route}
                                element={(
                                    <Fragment>
                                        {component}
                                    </Fragment>
                                )}
                            />
                        )
                    })}
                    {(!currentUser)
                          ?
                           <Route path="*" element={<Login />} />
                          :
                          <Route path="login" element={<Login />} />
                    }
            </Fragment>
        </Routes>
    </Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BaseRoute);
