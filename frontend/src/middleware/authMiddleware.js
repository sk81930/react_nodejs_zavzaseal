import agent from "../agent";
import { APP_LOAD, LOGIN, LOGOUT } from './../constants/actionTypes';

const emptyStoredValues = async () => {
	localStorage.setItem("isLoggedIn", "false");
	localStorage.setItem("email", "");
	if(localStorage.getItem('jwt')) { localStorage.setItem("jwt", ""); }
	localStorage.setItem("LSLT", "");
	localStorage.setItem("OSTL", "");
	agent.setToken(null);
}

const setStoredValues = async (payload) => {
	localStorage.setItem("jwt", payload.token);
	localStorage.setItem("LSLT", new Date().getTime());
	agent.setToken(payload.token);
}

const authMiddleware = (store) => (next) => (action) => {
	if (action.type === LOGIN) {
		if (action && !action.error && action.payload && action.payload.data) {
			setStoredValues(action.payload.data)
		}
	} else if (action.type === LOGOUT) {
		emptyStoredValues()
	} else if (action.type === APP_LOAD) {
		if (action.error) {
			emptyStoredValues();
		}
		if(action.payload == null && action.token == "") {
			emptyStoredValues();
		}
	}

	next(action);
}

export default authMiddleware;