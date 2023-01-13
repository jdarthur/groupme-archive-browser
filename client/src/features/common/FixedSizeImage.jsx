import React from 'react';
import "./FixedSizeImage.css"

export default function FixedSizeImage(props) {
    const style = {maxWidth: props.width, maxHeight: props.height}

    return (
        <div className={"wrapper"} style={{width: props.width, height: props.height}}>
            <div className={"bg"} style={{backgroundImage: `url(${props.src})`}}/>
            <figure>
                <img src={props.src} alt={props.alt} style={style}/>
            </figure>
        </div>

    );
}
