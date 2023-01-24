import React from 'react';
import {Empty, Table} from "antd";


const columns = [
    {
        title: "Alias",
        dataIndex: "name",
        key: "name"
    },
    {
        title: "Date",
        dataIndex: "created_at",
        key: "created_at",
        render: dateRender
    },
    {
        title: "Channel",
        dataIndex: "channel_id",
        key: "channel_id",
    },
]

function dateRender(text) {
    const createDate = Date.parse(text)
    return new Date(createDate).toLocaleDateString()
}


function normalizeData(data, allChannels) {
    const d = []
    for (let i = 0; i < data?.length; i++) {
        const value = {...data[i]}
        d.push({
            name: value.name,
            created_at: value.created_at,
            channel_id: channelName(allChannels, value.channel_id)
        })
    }
    return d
}

export default function FriendAliases(props) {

    const data = normalizeData(props.aliases, props.channels)

    let view = <div>
        <Empty description={"No data"} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{display: 'block'}}/>
    </div>
    if (props.aliases) {
        view = <Table dataSource={data}
                      columns={columns}
                      size={"large"}
                      style={{width: 800, maxWidth: '200vw'}}  >
            Content
        </Table>
    }
    return view
}

function channelName(allChannels, channelId) {
    for (let i = 0; i < allChannels.length; i++) {
        const channel = allChannels[i]
        if (channel.channel_id === channelId) {
            return channel.name
        }
    }
    return ""
}
