import React from 'react';
import {Button} from "antd";
import AlignedIconAndText from "./AlignedIconAndText";

//I Hate Ant Design So Much Sometimes

export default function SimpleButtonWithIconAndCorrectlyAlignedText(props) {

    const baseStyle = {
        padding: "0px 10px"
    }
    const style = {
        ...baseStyle,
        ...(props.style || {})
    }

    return <Button onClick={props.onClick} style={style}>
        <AlignedIconAndText icon={props.icon} text={props.text}/>
    </Button>
}