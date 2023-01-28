import React from 'react';
import {Popover} from "antd";
import FixedSizeImage from "../common/FixedSizeImage";

export default function PosterIdentity({members, userId, blue, name}) {

    if (name === null) {
        return null
    }

    const allMembers = members || []

    let realName = "Unknown"
    let url = ""

    for (let i = 0; i < allMembers.length; i++) {
        const member = allMembers[i]
        if (member.archive_member_id === userId) {
            realName = member.name
            url = member.image_url
        }
    }

    const content = <div>
        {url === "" ? null : <FixedSizeImage width={175} height={175} src={url}/>}
    </div>

    const style = {
        textDecoration: blue ? "" : "underline",
        marginRight: blue ? 5 : 10,
        color: blue ? "#003eb3" : ""
    }

    return <Popover title={realName}
                    content={content}
                    placement={"bottomRight"}
                    arrowPointAtCenter={true}>
        <span style={style}> {name} </span>
    </Popover>

}