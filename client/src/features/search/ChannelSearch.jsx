import React, {useState} from 'react';
import {Breadcrumb, Button, Divider, Input, Tag} from "antd";
import {
    useGetChannelsQuery,
    useGetMembersQuery,
    useLazySearchMessagesByLikeThresholdQuery,
    useLazySearchMessagesForTextQuery
} from "../../services/api";
import {useNavigate, useParams} from "react-router-dom";
import {Message} from "../messages/Message";
import {ArrowRightOutlined} from "@ant-design/icons";
import {useAuth} from "../../app/store";
import LoginNeeded from "../auth/LoginNeeded";
import PagedList from "../common/PagedList";
import LikeThreshold from "./LikeThreshold";

const BY_TEXT = "by text"
const BY_LIKE_COUNT = "by like count"

export default function ChannelSearch() {
    let {channelId} = useParams();
    let navigate = useNavigate()

    const [mode, setMode] = useState(BY_TEXT)

    const noToken = !useAuth().token

    const {data: members} = useGetMembersQuery(undefined, {skip: noToken})
    const {data: channels} = useGetChannelsQuery(undefined, {skip: noToken})

    const channelName = getChannelName(channelId, channels?.resource || [])

    const [search, textResults] = useLazySearchMessagesForTextQuery()
    const [byThreshold, likeThresholdResults] = useLazySearchMessagesByLikeThresholdQuery()

    const results = mode === BY_TEXT ? textResults : likeThresholdResults

    const onSearch = (value) => {
        setMode(BY_TEXT)
        search({channelId: channelId, body: {"search_text": value}})
    }

    const goTo = (messageId) => {
        navigate(`/messages/${channelId}?start=${messageId}`)
    }

    const onSearchByLikeThreshold = (value) => {
        console.log("search by like threshold: ", value)
        setMode(BY_LIKE_COUNT)
        byThreshold({channelId: channelId, body: {"like_threshold": value}})
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
                setOpen={() => {}}
            />
    })

    let resultCount = null
    if (!results.isFetching && r.length > 0) {
        resultCount = <Tag style={{marginLeft: 10}} >{r.length} results </Tag>
    }

    const s = {
        flexGrow: 1,
        minHeight: 0
    }

    const content = <div style={{display: "flex", flexDirection: "column", flex: "1 1 1px", minHeight: 0}}>
        <span style={{display: 'inline-flex', alignItems: "center", paddingTop: 10, paddingLeft: 10}}>
            <Input.Search placeholder="Search"
                          onSearch={onSearch}
                          style={{maxWidth: 300}}
                          loading={results.isFetching}
            />
            {resultCount}
            <LikeThreshold onSearch={onSearchByLikeThreshold}/>
        </span>

        <Divider style={{margin: 10}} />
        <div style={s}>
                <PagedList items={messageList} />
        </div>
    </div>

    return <div style={{height: "100%", width: '100%', display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
        <Breadcrumb style={{paddingTop: 10, paddingLeft: 10}}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            {channelName ? <Breadcrumb.Item>{channelName}</Breadcrumb.Item> : null}
            <Breadcrumb.Item>Search</Breadcrumb.Item>
        </Breadcrumb>

        {noToken ? <LoginNeeded /> : content}

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