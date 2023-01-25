import React from 'react';
import {Avatar, Card, Popover} from "antd";
import DateTime from "../common/DateTime";
import HighlightComponent from "./HighlightComponent";
import DeleteHighlight from "./DeleteHighlight";

const titleStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
}

export default function Highlight({members, member_id, created_at, title, components, highlightId, expanded}) {

    const member = getMember(members?.resource, member_id)
    const extra = <span>
        {getIcon(member, created_at)}
        <DeleteHighlight highlightId={highlightId} memberId={member_id} />
    </span>
    const t = <span style={titleStyle}>
        <span>
            {title}
        </span>
        {extra}
    </span>

    const c = components?.map((component, i) => (
        <HighlightComponent key={`component-${i}`}
                            members={members}
                            highlightId={highlightId}
                            type={component.type}
                            comment={component.comment}
                            first_message_id={component.first_message_id}
                            last_message_id={component.last_message_id}
                            avatar={avatar(member, 35)}
                            expanded={expanded}
        />
    ))

    return (
        <Card title={t}
              bodyStyle={{padding: 0}}
              style={{margin: 10, maxWidth: "min(500px, 90vw)"}}>
            {c}
        </Card>
    );
}

export function getIcon(member, created_at) {
    if (member !== null) {
        const dt = <DateTime date={created_at} full/>

        const content = <div style={{maxWidth: 150}}>
            Created by {member.name} at {dt}
        </div>

        return <Popover title={"Details"} content={content}>
                <span style={{fontWeight: "normal", fontSize: "0.9em"}}>
                    {avatar(member, 40)}
                    {member.name}
                </span>
        </Popover>
    }
    return null
}

export function avatar(member, size) {
    return <Avatar style={{width: size, height: size, marginRight: 5}} src={member?.image_url}/>
}

export function getMember(members, member_id) {
    for (let i = 0; i < members?.length; i++) {
        const m = members[i]
        if (m.user_id === member_id) {
            return m
        }
    }
    return null
}