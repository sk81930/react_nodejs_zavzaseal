import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createBrowserHistory } from "history";
import './index.css';
import App from './Components/app';
import { store } from './store';
import reportWebVitals from './reportWebVitals';

const history = createBrowserHistory({ window });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
    </Provider>
);
reportWebVitals();
