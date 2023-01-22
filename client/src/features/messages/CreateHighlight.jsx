import React from 'react';
import SimpleButtonWithIconAndCorrectlyAlignedText from "../common/SimpleButtonWithIconAndCorrectlyAlignedText";
import {HighlightOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

export default function CreateHighlight({message_id}) {
    const url = `/highlights?create=true&start=${message_id}`
    const navigate = useNavigate()

    const onClick = () => {
        navigate(url)
    }

    return <SimpleButtonWithIconAndCorrectlyAlignedText
        onClick={onClick}
        icon={<HighlightOutlined />}
        text={"Highlight"}
        style={{margin: "0px 5px"}}
    />
}