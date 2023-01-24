import React from 'react';
import {Breadcrumb, Button, Divider, Input, Tag} from "antd";
import {useGetChannelsQuery, useGetMembersQuery, useLazySearchMessagesForTextQuery} from "../../services/api";
import {useNavigate, useParams} from "react-router-dom";
import {Message} from "../messages/Message";
import {ArrowRightOutlined} from "@ant-design/icons";
import {rootMessagesStyle} from "../messages/Messages";
import {useAuth} from "../../app/store";


export default function ChannelSearch() {
    let {channelId} = useParams();
    let navigate = useNavigate()

    const noToken = !useAuth().token

    const {data: members} = useGetMembersQuery(undefined, {skip: noToken})
    const {data: channels} = useGetChannelsQuery(undefined, {skip: noToken})

    const channelName = getChannelName(channelId, channels?.resource || [])

    const [search, results] = useLazySearchMessagesForTextQuery()

    const onSearch = (value) => {
        search({channelId: channelId, body: {"search_text": value}})
    }

    const goTo = (messageId) => {
        navigate(`/messages/${channelId}?start=${messageId}`)
    }

    const r = results?.data?.resource || []
    const messageList = r.map((message) => {

        const contextButton = <Button key={`view-in-context_${message.message_id}`}
                                      onClick={() => goTo(message.message_id)}>
            View
            <ArrowRightOutlined style={{fontSize: "0.8em"}} />
        </Button>


        return <Message
                key={message.message_id}
                name={message.poster_name}
                date={message.date}
                text={message.message_text}
                avatar_url={message.avatar_url}
                user_id={message.user_id}
                attachments={message.message_attachments}
                members={members}
                liked_by={message.liked_by}
                channelId={message.channel_id}
                contextButton={contextButton}
                message_id={message.message_id}
            />
    })

    let resultCount = null
    if (!results.isFetching && r.length > 0) {
        resultCount = <Tag style={{marginLeft: 10}} >{r.length} results </Tag>
    }

    const s = {...rootMessagesStyle}
    s.overflowX = "visible"

    return <div>
        <Breadcrumb style={{paddingTop: 10, paddingLeft: 10}}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>{channelName}</Breadcrumb.Item>
            <Breadcrumb.Item>Search</Breadcrumb.Item>
        </Breadcrumb>

        <span style={{display: 'inline-flex', alignItems: "center", paddingTop: 10, paddingLeft: 10}}>
            <Input.Search placeholder="Search"
                          onSearch={onSearch}
                          style={{maxWidth: 300}}
                          loading={results.isFetching}
            />
            {resultCount}
        </span>

        <Divider />
        <div style={s}>
            <div style={{display: "flex", flexDirection: "column", flex: 1}}>
                {messageList}
            </div>
        </div>

    </div>

}

function getChannelName(channelId, channels) {
    for (let i = 0; i < channels.length; i++) {
        if (channels[i].channel_id === channelId) {
            return channels[i].name
        }
    }
    return ""
}