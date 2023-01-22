import React from 'react';
import SimpleButtonWithIconAndCorrectlyAlignedText from "../common/SimpleButtonWithIconAndCorrectlyAlignedText";
import {ShareAltOutlined} from "@ant-design/icons";
import {notification} from "antd";

export default function ShareMessage({message_id, channelId}) {

    const openNotification = () => {
        console.log("openNotification")
        notification.success({
            message: 'Success',
            description: "Link copied to clipboard",
            placement: "topRight"
        })
    };

    const onClick = (event) => {
        event.stopPropagation()
        const url = `${window.location.origin}/channels/${channelId}/messages?start=${message_id}`
        navigator.clipboard.writeText(url).then(() => {
            openNotification()
        })
    }

    return <SimpleButtonWithIconAndCorrectlyAlignedText
        onClick={onClick}
        icon={<ShareAltOutlined />}
        text={"Share"}
        style={{margin: "0px 5px"}}
    />
}