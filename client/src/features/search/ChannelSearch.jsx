import React, {useState} from 'react';
import {Breadcrumb, Divider, Input, Tag} from "antd";
import {
    useGetChannelsQuery,
    useLazySearchMessagesByLikeThresholdQuery,
    useLazySearchMessagesForTextQuery
} from "../../services/api";
import {useParams} from "react-router-dom";
import {useAuth} from "../../app/store";
import LoginNeeded from "../auth/LoginNeeded";
import LikeThreshold from "./LikeThreshold";
import PagedListOfMessagesWithContextLink from "./PagedListOfMessagesWithContextLink";

const BY_TEXT = "by text"
const BY_LIKE_COUNT = "by like count"

export default function ChannelSearch() {
    let {channelId} = useParams();

    const [mode, setMode] = useState(BY_TEXT)

    const noToken = !useAuth().token
    const {data: channels} = useGetChannelsQuery(undefined, {skip: noToken})

    const channelName = getChannelName(channelId, channels?.resource || [])

    const [search, textResults] = useLazySearchMessagesForTextQuery()
    const [byThreshold, likeThresholdResults] = useLazySearchMessagesByLikeThresholdQuery()

    const results = mode === BY_TEXT ? textResults : likeThresholdResults

    const onSearch = (value) => {
        setMode(BY_TEXT)
        search({channelId: channelId, body: {"search_text": value}})
    }

    const onSearchByLikeThreshold = (value) => {
        console.log("search by like threshold: ", value)
        setMode(BY_LIKE_COUNT)
        byThreshold({channelId: channelId, body: {"like_threshold": value}})
    }

    const r = results?.data?.resource || []
    const messageList = <PagedListOfMessagesWithContextLink messages={r} loading={results.isFetching} />

    let resultCount = null
    if (!results.isFetching && r.length > 0) {
        resultCount = <Tag style={{marginLeft: 10}} >{r.length} results </Tag>
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
        {messageList}
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