import React from "react";
import Login2 from "./Login2";

const LoginNeeded = () => {
    return (
        <div style={{padding: 10}}>
            <div style={{marginBottom: 10}}>You must login to view this page.</div>
            <Login2 />
        </div>
    );
};

export default LoginNeeded;