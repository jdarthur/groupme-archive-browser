import React from 'react';
import {Popover} from "antd";
import FixedSizeImage from "../common/FixedSizeImage";

export default function PosterIdentity(props) {

    const allMembers = props.members || []

    let realName = "Unknown"
    let url = ""

    for (let i = 0; i < allMembers.length; i++) {
        const member = allMembers[i]
        if (member.archive_member_id === props.userId) {
            realName = member.name
            url = member.image_url
        }
    }

    const content = <div>
        {url === "" ? null : <FixedSizeImage width={175} height={175} src={url}/>}
    </div>

    const style = {
        textDecoration: props.blue ? "" : "underline",
        marginRight: props.blue ? 5 : 10,
        color: props.blue ? "#003eb3" : ""
    }

    return <Popover title={realName}
                    content={content}
                    placement={"bottomRight"}
                    arrowPointAtCenter={true}>
        <span style={style}> {props.name} </span>
    </Popover>

}