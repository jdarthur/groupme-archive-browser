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

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID

root.render(
    <React.StrictMode>
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            redirectUri={window.location.origin}
            useRefreshTokens={true}
            cacheLocation="localstorage"
            audience={audience}
            scope="openid profile email offline_access read:current_user">

            <Provider store={store}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </Provider>
        </Auth0Provider>

    </React.StrictMode>)

