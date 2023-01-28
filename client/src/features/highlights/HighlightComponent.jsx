import React from 'react';
import {Button, Spin} from "antd";
import {useGetHighlightComponentQuery} from "../../services/api";
import {Message} from "../messages/Message";
import {useNavigate} from "react-router-dom";

const THREAD_STARTING_ENDING = "thread_starting_and_ending_with"

const componentStyle = {
    alignSelf: "flex-start",
    display: "inline-flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 5
}

const viewInContextStyle = {
    borderLeft: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "center",
    width: "97%",
    alignSelf: "flex-end",
    padding: 10,
    background: "white"
}

const contentStyle = {
    alignSelf: "flex-end",
    width: '97%',
    borderLeft: "1px solid #f0f0f0",
    paddingLeft: 5,
    background: "white"
}

export default function HighlightComponent({
                                               type,
                                               first_message_id,
                                               last_message_id,
                                               avatar,
                                               comment,
                                               highlightId,
                                               expanded
                                           }) {

    const highlightQuery = {
        type: type,
        first_message_id: first_message_id,
        last_message_id: last_message_id ? last_message_id : "none",
    }

    const {data, isFetching} = useGetHighlightComponentQuery(highlightQuery)

    let moreButton = null
    if (type === THREAD_STARTING_ENDING) {
        const title = `And ${data?.resource.length - 1} more messages...`
        moreButton = <div style={{display: "flex", justifyContent: "center", width: "100%", background: "white", borderTop: "1px solid #f0f0f0"}}>
            <Button style={{margin: 10, alignSelf: "center"}}>
                <a href={`/highlights/${highlightId}`}>{title}</a>
            </Button>
        </div>
    }

    const channelId = data?.resource[0].channel_id
    const navigate = useNavigate()
    const clickContext = () => {
        const url = `/messages/${channelId}?start=${first_message_id}`
        navigate(url)
    }

    if (isFetching) {
        return <Spin/>
    }

    let viewInContext = <Button onClick={clickContext} style={{marginBottom: 10}}>
        View in context
    </Button>

    let allMessages = data?.resource.map((message, i) => {
            const previous = i === 0 ? {} : data?.resource[i - 1]
            return <Message
                key={message.message_id}
                message_id={message.message_id}
                name={message.poster_name}
                date={message.date}
                text={message.message_text}
                avatar_url={message.avatar_url}
                user_id={message.user_id}
                attachments={message.message_attachments}
                previous_date={previous?.date}
                previous_message_id={previous?.message_id}
                previous_user_id={previous?.user_id}
                liked_by={message.liked_by}
                channelId={message.channel_id}
                disavowal={message.disavowal}
                end_of_the_line={message.end_of_the_line}
                hideTopDate={!expanded}
            />
        }
    )

    const component = (
        <span style={componentStyle}>
            <span>{avatar}</span>
            <span style={{fontStyle: "italic", marginLeft: 10}}>
                {comment}
            </span>
        </span>
    )

    const content = expanded ? allMessages : (allMessages?.length ? allMessages[0] : null)

    return (
        <div style={{display: 'flex', alignItems: "flex-start", flexDirection: "column", background: "#f5f5f5"}}>
            <div style={{background: "white", width: "100%", paddingBottom: 10}}>{comment ? component : null}</div>

            <div style={{borderBottom: '1px solid #f0f0f0', alignSelf: "stretch"}}/>
            <div style={viewInContextStyle}>
                {expanded ? viewInContext : null}
            </div>

            <div style={contentStyle}>
                {content}
            </div>
            {expanded ? null : moreButton}

        </div>
    );
}
