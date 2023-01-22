import React from 'react';

export default function AlignedIconAndText(props) {
    return <div style={{display: "flex", alignItems: "center"}}>
        <div style={{marginRight: "0.5em", fontSize: '1.0em'}}>
            {props.icon}
        </div>
        <div style={{alignItems: "center", display: "flex"}}>
            {props.text}
        </div>
    </div>
}