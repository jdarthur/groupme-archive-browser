import React from 'react';

function style(selected){
    return  {
        border: '1px solid #bfbfbf',
        background: selected? "#bae7ff": "",
        width: 20,
        height: 20,
        borderRadius: 10,
        marginTop: 5,
        cursor: "pointer",
        marginRight: 20,
        flexShrink: 0
    }
}

export default function SelectMessage({selected, messageId, index, setSelected}) {
    const onClick = () => {
        setSelected(messageId, index)
    }

    return (
        <div style={style(selected)}
             onClick={onClick}/>
    );
}


