import React, {useState} from 'react';
import {MemoMessage} from "./Message";
import {Spin} from "antd";

export const listOfMessagesStyle = {
    overflowY: "auto",
    wordBreak: "break-word",
    borderBottom: "1px solid #f0f0f0",
    flex: 1
}

export default function ListOfMessages({isFetching, messages, showMoreBefore, showMoreAfter}) {
    const [open, setOpen] = useState(false)

    const onClick = (id) => {
        if (open === id) {
            setOpen(null)
        } else {
            setOpen(id)
        }
    }

    if (isFetching) {
        return <Spin size={"large"} style={{margin: 50}}/>
    }

    const m = messages || []
    const mView = []

    for (let i = 0; i < m.length; i++) {
        const message = m[i]
        const previousMessage = i > 0 ? m[i-1] : {}
        mView.push(<MemoMessage
                key={message.message_id}
                message_id={message.message_id}
                name={message.poster_name}
                date={message.date}
                text={message.message_text}
                avatar_url={message.avatar_url}
                user_id={message.user_id}
                attachments={message.message_attachments}
                previous_date={previousMessage?.date}
                previous_user_id={previousMessage?.user_id}
                previous_message_id={previousMessage?.message_id}
                open={open === message.message_id}
                setOpen={onClick}
                liked_by={message.liked_by}
                channelId={message.channel_id}
                disavowal={message.disavowal}
                end_of_the_line={message.end_of_the_line}
        />)
    }


    return <div id={"messages-root"} style={listOfMessagesStyle}>
        {showMoreBefore}
        {mView}
        {showMoreAfter}
    </div>
}