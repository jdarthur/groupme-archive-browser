import React from 'react';
import {useGetMembersQuery} from "../../services/api";
import {Breadcrumb, Card, Spin} from "antd";
import InlineStatistic from "../common/InlineStatistic";
import FixedSizeImage from "../common/FixedSizeImage";
import {useAuth} from "../../app/store";
import LoginNeeded from "../auth/LoginNeeded";

export default function AllMembers() {
    const noToken = !useAuth().token
    const {data, isFetching} = useGetMembersQuery(undefined, {skip: noToken})

    const friends = data?.resource || []
    const cards = friends.map((friend, i) => {
            return <Card title={<a href={`friends/${friend.user_id}`}> {friend.name} </a>}
                         size="small"
                         style={{margin: 10, width: 325}}
                         key={friend.user_id}>
                <div style={{display: "flex"}}>
                    <div style={{marginRight: 10}}>
                        <FixedSizeImage width={200} height={200} src={friend.image_url} alt={`Avatar for ${friend.name}`}/>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        flex: "1",
                        justifyContent: "space-between"
                    }}>
                        <InlineStatistic name={"Channels"} value={friend.channels.length}/>
                        <InlineStatistic name={"Aliases"} value={friend.aliases.length}/>
                        <InlineStatistic name={"Posts"} value={friend.message_count}/>
                    </div>
                </div>

                {/*<p style={{fontStyle:"italic", marginTop: 25, fontSize: "1.1em"}}>"{channel.description}"</p>*/}
            </Card>

        }
    )

    return (
        <div style={{padding: 10}}>
            <Breadcrumb>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Friends</Breadcrumb.Item>
            </Breadcrumb>
            {isFetching ? <Spin size={"large"} style={{padding: 100}}/> :
                <div style={{display: "flex", flexWrap: "wrap"}}>
                    {noToken ? <LoginNeeded />: cards}
                </div>
            }
        </div>
    );
}
