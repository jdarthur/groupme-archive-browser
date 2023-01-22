import React from 'react';
import {Provider} from 'react-redux';
import './index.css';
import {store} from "./app/store";
import {BrowserRouter} from "react-router-dom";
import {Auth0Provider} from "@auth0/auth0-react";

import {createRoot} from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <Auth0Provider
            domain="borttrivia.us.auth0.com"
            clientId="h1lPD3dlRa3f6U7fCKKjTS9FWbv7oDSN"
            redirectUri={window.location.origin}
            useRefreshTokens={true}
            cacheLocation="localstorage"
            audience="https://borttrivia.com/editor"
            scope="openid profile email offline_access read:current_user">

            <Provider store={store}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </Provider>
        </Auth0Provider>,

    </React.StrictMode>)

