import React from 'react';
import {Provider} from 'react-redux';
import './index.css';
import {store} from "./app/store";
import {BrowserRouter} from "react-router-dom";

import {createRoot} from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);


root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);

