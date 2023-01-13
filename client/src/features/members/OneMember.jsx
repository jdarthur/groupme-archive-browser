import React from 'react';
import {Breadcrumb, Card, Tabs} from "antd";
import {useGetChannelsQuery, useGetMemberQuery} from "../../services/api";
import {Link, useParams} from "react-router-dom";
import FriendAliases from "./FriendAliases";
import FixedSizeImage from "../common/FixedSizeImage";
import InlineStatistic from "../common/InlineStatistic";
import FriendAvatars from "./FriendAvatars";

const sideBarStyle = {
    paddingTop: 25,
    paddingLeft: 15,
    height: '100%',
    // borderTop: "1px solid #d9d9d9",
    // borderRight: "1px solid #d9d9d9",
    background: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start"
}

export default function OneMember() {

    const {data: channelsData} = useGetChannelsQuery()

    let { friendId } = useParams();


    const {data, isFetching} = useGetMemberQuery(friendId)
    console.log(data, isFetching)

    const friend = data?.resource || {}
    const aliases = <div>
        <FriendAliases aliases={friend.aliases || []} channels={channelsData?.resource || []} />
    </div>

    const name = friend.name || ""

    return (
        <div>
            <Breadcrumb style={{margin: 15}}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item><Link to={"/friends"}>Friends</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{name}</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{display: "flex", flexWrap: "wrap"}}>
                <div style={{display: "flex"}}>
                    <div style={sideBarStyle}>
                        <div style={{fontSize: "1.5em", paddingBottom: 10, color: "#434343"}}>{friend.name}</div>
                        <div style={{marginBottom: 10}}>
                            <FixedSizeImage src={friend.image_url} width={300} height={300} alt={`Avatar for ${friend.name}`} />
                        </div>
                        <div style={{marginBottom: 10}}>
                            <InlineStatistic big name={"Channels"} value={friend.channels?.length} />
                        </div>
                        <div style={{marginBottom: 10}}>
                            <InlineStatistic big name={"First Seen"} value={firstSeen(friend.aliases || [])} />
                        </div>
                        <div style={{marginBottom: 10}}>
                            <InlineStatistic big name={"Posts"} value={friend.message_count} />
                        </div>


                    </div>
                    <div style={{flex: 1, display: "flex", flexDirection:"column", alignItems: "flex-start", marginLeft: 25}}>
                        <Tabs defaultActiveKey={"1"}
                              items={[
                                  {label: "Aliases", key: "1", children: aliases},
                                  {label: "Avatars", key: "2", children: <FriendAvatars aliases={friend.aliases || []} />}
                              ]}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

function firstSeen(allAliases) {
    if (allAliases.length === 0) {
        return ""
    }
    let lowest = allAliases[0].created_at
    for (let i = 0; i < allAliases.length; i++) {
        const v = allAliases[i].created_at
        if (v < lowest) {
            lowest = v
        }
    }
    const createDate = Date.parse(lowest)
    return new Date(createDate).toLocaleDateString()
}
