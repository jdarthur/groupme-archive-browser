import {useGetMessagesDefaultQuery, useGetMessagesFromMessageIdQuery, useGetMessagesQuery} from "../../services/api";
import ListOfMessages from "./ListOfMessages";
import React from "react";

export default function DefaultMessagesView(props) {

    const args = {
        apiBase: props.firstMessageId ? "/messages/around/" : "/channels/",
        messageId: props.firstMessageId ? props.firstMessageId : null,
        channelId: props.channelId ? props.channelId: null,
        endSegment: props.firstMessageId ? "" : "messages",
        query: props.firstMessageId ? "?retainMessageId=true" : ""
    }


    const {data, isFetching} = useGetMessagesDefaultQuery(args)

    if (props.firstMessageId) {
        return <ListOfMessages messages={data?.resource} isFetching={isFetching} reverse={props.reverse} />
    } else {
        return <ListOfMessages messages={data?.resource} isFetching={isFetching} reverse={props.reverse} />
    }
}