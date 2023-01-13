import React from 'react';

export default function NamesList(props) {
    const max = 5;

    const nameList = props.names.map((name, i) => {
        if (i === max) {
            return <span style={{fontStyle: "italic"}}>
                And {props.names.length - max} more...
            </span>
        } else if (i > max) {
            return null
        }

        const slash = i === props.names.length - 1 ? "" : "•"

        return <span style={{fontStyle: "italic"}}>
            <span style={{marginRight: ".7em"}}>
                "{name}"
            </span>
            <span style={{marginRight: '.7em', color: '#bfbfbf'}}>{slash}</span>
        </span>
    })


    return <div>
        {nameList}
    </div>

}