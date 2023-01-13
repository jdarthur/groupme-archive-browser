import React, {useState} from 'react';
import Message from "./Message";
import {Spin} from "antd";
import {useGetMembersQuery} from "../../services/api";

export const listOfMessagesStyle = {
overflowY: "auto", wordBreak: "break-word", borderBottom: "1px solid #f0f0f0", flex: 1
}

export default function ListOfMessages(props) {
    const {data: members} = useGetMembersQuery()
    const [open, setOpen] = useState(false)

    const onClick = (id) => {
        if (open === id) {
            setOpen(null)
        } else {
            setOpen(id)
        }
    }

    if (props.isFetching) {
        return <Spin size={"large"} style={{margin: 50}}/>
    }

    const m = props.messages || []
    const mView = []

    for (let i = 0; i < m.length; i++) {
        const message = m[i]
        const previousMessage = i > 0 ? m[i-1] : {}
        mView.push(<Message
                key={message.message_id}
                name={message.poster_name}
                date={message.date}
                text={message.message_text}
                avatar_url={message.avatar_url}
                user_id={message.user_id}
                attachments={message.message_attachments}
                members={members}
                previousMessage={previousMessage}
                open={open === message.message_id}
                setOpen={() => onClick(message.message_id)}
                liked_by={message.liked_by}
                channelId={message.channel_id}
        />)
    }


    return <div id={"messages-root"} style={listOfMessagesStyle}>
        {props.showMoreBefore}
        {mView}
        {props.showMoreAfter}
    </div>
}