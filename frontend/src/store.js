import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from '@redux-devtools/extension';
import { mainMiddleware, authMiddleware } from './middleware';
import reducer from "./reducers";

const getMiddleware = () => {
	return applyMiddleware(
		mainMiddleware,
		authMiddleware
    );
};

export const store = createStore(reducer, composeWithDevTools(getMiddleware()));