import React from 'react';

const baseStyle = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 15,
    flexDirection: "column"
}

export default function FormItem({label, input}) {

    return <span style={baseStyle}>
        <span style={{fontSize: "1.0em", paddingBottom: 5, color: "#434343"}}>{label}:</span>
        <span style={{width: '100%'}}>{input}</span>
    </span>
}



