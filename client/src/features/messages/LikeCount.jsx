import React from 'react';
import {HeartOutlined} from "@ant-design/icons";
import {Avatar, Popover} from "antd";

export default function LikeCount(props) {
    const likeCount = props.likes?.length || 0
    const likes = props.likes || []
    const style = {
        marginLeft: 10,
        marginRight: '1em',
        color: "#8c8c8c",
        fontSize: '0.85em',
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        position: "relative"
    }

    const x = <div style={style}>
        <HeartOutlined style={{fontSize: "1.15em"}}/>
        <span style={{marginLeft: 5, fontSize: '0.9em'}}>{likeCount}</span>
    </div>


    if (likeCount === 0) {
        return x
    }

    const l = likes.map((userId) => {
        return userFromId(userId, props.members?.resource || [], props.date)
    })

    return <Popover title={"Liked by"}
                    content={l}
                    placement={"left"}>
        {x}
    </Popover>

}

function userFromId(userId, members, date) {
    for (let i = 0; i < members?.length; i++) {
        const member = members[i]

        let imageUrl = null
        if (member.archive_member_id === userId) {
            let j = 0
            for (j; j <= member.aliases.length; j++) {
                const alias = member.aliases[j]
                if (alias?.created_at >= date) {
                    imageUrl = alias.avatar_url
                }
            }

            return <span key={userId} style={{display: "flex", alignItems: "center", cursor: "pointer", marginTop: 5}}>
                {imageUrl? <Avatar size={"default"} src={imageUrl} /> : null}
                {/*<FixedSizeImage width={50} height={50} src={member.image_url}/>*/}
                <span style={{marginLeft: 5}}>{member.name}</span>
            </span>
        }
    }
    return null
}

