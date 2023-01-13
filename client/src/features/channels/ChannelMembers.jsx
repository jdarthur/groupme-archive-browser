import React from 'react';
import {Popover} from "antd";

export default function ChannelMembers(props) {
    const members = props.members || []

    const membersList = members.map((member, i) => {
        const comma = i === (members.length - 1) ? "" : ", "
        return <a href={`friends/${member.user_id}`}> {member.name}{comma} </a>
    })
    return (
        <Popover title="Channel Members" content={membersList} overlayInnerStyle={{width: 250}}>
            <span style={{textDecoration: "underline", cursor: "pointer"}}>
                {members.length}
            </span>
        </Popover>
    );
}
