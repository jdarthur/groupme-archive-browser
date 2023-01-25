import React from 'react';
import {Spin} from "antd";
import {useGetChannelsQuery} from "../../services/api";
import FixedSizeImage from "../common/FixedSizeImage";
import {Link} from "react-router-dom";
import {useAuth} from "../../app/store";
import LoginNeeded from "../auth/LoginNeeded";

export default function ListOfChannelsLandingPage(props) {
    const noToken = !useAuth().token
    const {data, isFetching} = useGetChannelsQuery(undefined, {skip: noToken})

    if (isFetching) {
        return <Spin size={"large"} style={{margin: 50}}/>
    }

    const channels = data?.resource || []
    const list = channels.map((channel) => <div>
        <span key={channel.channel_id} style={{margin: 10}}>
            <div style={{marginRight: 10}}>
                <FixedSizeImage src={channel.image_url} width={100} height={100}/>
            </div>
            <Link to={`/${props.destination}/${channel.channel_id}`}> {channel.name} </Link>
        </span>
    </div>)

    const select = <div>
        <div>Select a channel:</div>
        {list}
    </div>

    return <div style={{display: "flex", alignItems: "flex-start", padding: 10, flexDirection: "column"}}>
        {noToken ? <LoginNeeded/> : select}
    </div>

}