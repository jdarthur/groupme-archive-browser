import React from 'react';
import {Button, Spin} from "antd";
import {Message} from "../messages/Message";
import {ArrowRightOutlined} from "@ant-design/icons";
import PagedList from "../common/PagedList";
import {useNavigate} from "react-router-dom";
import {useGetMembersQuery} from "../../services/api";
import {useAuth} from "../../app/store";

// Used by both the Channel Search page & the Top Posts page, essentially a version of
// ListOfMessages that has paging built in and shows the "View ->" button to jump
// to the message in context.
export default function PagedListOfMessagesWithContextLink({messages, loading, doNotHighlight}) {
    let navigate = useNavigate()
    const noToken = !useAuth().token
    const {data: members} = useGetMembersQuery(undefined, {skip: noToken})

    if (loading) {
        return <Spin size={"large"} style={{padding: 50}} />
    }

    const goTo = (messageId, channelId) => {
        navigate(`/messages/${channelId}?start=${messageId}`)
    }

    const messageList = messages.map((message) => {

        const contextButton = <Button key={`view-in-context_${message.message_id}`}
                                      onClick={() => goTo(message.message_id, message.channel_id)}>
            View
            <ArrowRightOutlined style={{fontSize: "0.8em"}} />
        </Button>

        return <Message
            key={message.message_id}
            name={message.poster_name}
            date={message.date}
            text={message.message_text}
            avatar_url={message.avatar_url}
            user_id={doNotHighlight ? '':  message.user_id}
            attachments={message.message_attachments}
            members={members}
            liked_by={message.liked_by}
            channelId={message.channel_id}
            contextButton={contextButton}
            message_id={message.message_id}
            setOpen={() => {}}
        />
    })

    const s = {
        flexGrow: 1,
        minHeight: 0
    }

    return <div style={s}>
        <PagedList items={messageList || []} />
    </div>
}