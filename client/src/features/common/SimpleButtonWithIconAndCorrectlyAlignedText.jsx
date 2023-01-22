import React from 'react';
import {Button} from "antd";
import AlignedIconAndText from "./AlignedIconAndText";

//I Hate Ant Design So Much Sometimes

export default function SimpleButtonWithIconAndCorrectlyAlignedText({style, loading, onClick, disabled, icon, text, type}) {

    const baseStyle = {
        padding: "0px 10px"
    }
    const s = {
        ...baseStyle,
        ...(style || {})
    }

    return <Button onClick={onClick}
                   style={s}
                   loading={loading}
                   type={type}
                   disabled={disabled} >
        <AlignedIconAndText icon={icon} text={text}/>
    </Button>
}