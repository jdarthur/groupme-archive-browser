import React from 'react';
import {useGetChannelsQuery} from "../../services/api";
import {Breadcrumb, Card} from "antd";

import InlineStatistic from "../common/InlineStatistic";
import ChannelMembers from "./ChannelMembers";
import FixedSizeImage from "../common/FixedSizeImage";
import {useAuth} from "../../app/store";

export default function AllChannels() {
    const noToken = !useAuth().token
    const {data, isFetching} = useGetChannelsQuery({skip: noToken})

    const channels = data?.resource || []

    const cards = channels.map((channel) => {

        const createDate = Date.parse(channel.created_at)
        const displayDate = new Date(createDate).toLocaleDateString()

        return  <Card key={channel.channel_id} title={<a href={`channels/${channel.channel_id}/messages`}> {channel.name} </a>}
                      size="small"
                      style={{margin: 10, width: 350, maxWidth: "80vw"}} >
            <div style={{display: "flex"}}>
                <div style={{marginRight: 10}}>
                    <FixedSizeImage width={200} height={200} src={channel.image_url} alt={`Avatar for group "${channel.name}"`} />
                </div>

                {/*<img src={channel.image_url} style={centeredCropped} alt={"Group avatar"}/>*/}
                <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", flex: "1", justifyContent: "space-between"}}>
                    <InlineStatistic name={"Messages"} value={channel.message_count} />
                    <InlineStatistic name={"Members"} value={<ChannelMembers members={channel.members} />} />
                    <InlineStatistic name={"Created"} value={displayDate} />
                </div>
            </div>

            <div style={{fontStyle:"italic", paddingTop: 25, fontSize: "1.1em", textAlign: "center"}} >"{channel.description}"</div>
        </Card>

    })
    return (
        <div>
            <Breadcrumb style={{margin: 15}}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Channels</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {cards}
            </div>
        </div>
    );
}
