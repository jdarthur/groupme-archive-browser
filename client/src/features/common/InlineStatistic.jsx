import React from 'react';

export default function InlineStatistic({big, name, value}) {

    let nameSize = "0.85em"
    let valueSize = "1.1em"
    let marginBottom = 0
    if (big) {
        nameSize = "1.0em"
        valueSize = "1.3em"
        marginBottom = 10
    }

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
            <div style={{fontSize: nameSize, color: "#8c8c8c", marginBottom: marginBottom}}>
                {name}:
            </div>
            <div style={{fontSize: valueSize}}>
                {value}
            </div>
        </div>
    );
}
