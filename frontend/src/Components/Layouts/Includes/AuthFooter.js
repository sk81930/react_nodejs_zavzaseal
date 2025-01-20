import React, { useEffect, useState, Fragment } from "react";
import { connect } from "react-redux";

const mapStateToProps = (state) => {
	return {
		...state,
	}
};

const mapDispatchToProps = (dispatch) => ({
});

const AuthFooter = (props) => {

	return (
      	<div className="header-main">
			footer
      	</div>
    );
};


export default connect(mapStateToProps, mapDispatchToProps)(AuthFooter);