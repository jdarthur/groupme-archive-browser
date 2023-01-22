import React, {useState} from 'react';
import {Button, Popover} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {useDeleteHighlightMutation, useGetMembersQuery} from "../../services/api";
import {useAuth0} from "@auth0/auth0-react";


export default function DeleteHighlight({highlightId, memberId}) {

    const {data: members} = useGetMembersQuery()

    const [deleteHighlight] = useDeleteHighlightMutation()

    const [open, setOpen] = useState(false)

    const {user} = useAuth0()
    let sub = null
    if (user) {
        sub = user.sub
    }

    const clickDelete = () => {
        console.log("delete highlight ", highlightId)
        deleteHighlight(highlightId)
        setOpen(false)
    }

    const isMine = isMyHighlight(members?.resource, memberId, sub)
    if (!isMine) {
        return null
    }

    const content = <span>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button type={"primary"} danger onClick={clickDelete}>Delete</Button>
    </span>


    return (
        <Popover title={"Delete this highlight?"} open={open} content={content}>
            <DeleteOutlined style={{marginLeft: '0.5em', fontSize: "1.2em"}}
                            onClick={() => setOpen(true)} />
        </Popover>
    );
}

function isMyHighlight(members, member_id, sub) {
    for (let i = 0; i < members?.length; i++) {
        const member = members[i]
        if (member.auth0_sub === sub && member.user_id === member_id) {
            console.log(`match highlight member ID ${member_id} to member with sub ${member.auth0_sub}, name ${member.name}`)
            return true
        }
    }
    return false
}


