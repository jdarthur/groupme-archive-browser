import React, {useState} from 'react';
import {Input, Modal, Select, Tag} from "antd";
import FormItem from "../common/FormItem";
import MessagePreview from "./MessagePreview";
import {useCreateHighlightMutation, useGetMembersQuery} from "../../services/api";
import {useAuth} from "../../app/store";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";



const ONE_MESSAGE = "one_message"
const THREAD = "thread_starting_and_ending_with"

const typeOptions = [
    {value: ONE_MESSAGE, label: "One message"},
    {value: THREAD, label: "Thread"}
]

export default function CreateHighlight({visible, firstMessageId, cancel, setVisible}) {

    const [type, setType] = useState(ONE_MESSAGE)
    const [firstMessage, setFirstMessage] = useState(firstMessageId)
    const [lastMessage, setLastMessage] = useState(null)
    const [comment, setComment] = useState("")
    const [title, setTitle] = useState("")
    const [messageCount, setMessageCount] = useState(1)

    const noToken = !useAuth().token
    const {data: members} = useGetMembersQuery(undefined, {skip: noToken})
    const [createHighlight] = useCreateHighlightMutation()
    const navigate = useNavigate()

    const {user} = useAuth0()
    let sub = null
    if (user) {
        sub = user.sub
    }


    const memberId = getMemberId(members, sub)

    const titleInput = <Input value={title} onChange={(event) => setTitle(event.target.value)} />

    const commentInput = <Input.TextArea value={comment}
                                         onChange={(event) => setComment(event.target.value)}
                                         placeholder={"Add a comment (optional)"} />

    const typeSelect = <Select options={typeOptions}
                               value={type}
                               onSelect={(value) => setType(value)}
                               style={{width: '100%'}} />

    const firstMessagePreview = <MessagePreview messageId={firstMessage} setMessageId={setFirstMessage} disabled />
    const lastMessagePreview = <MessagePreview messageId={lastMessage}
                                               firstMessageId={firstMessage}
                                               setMessageId={setLastMessage}
                                               setMessageCount={setMessageCount} />

    const save = () => {
        const body = {
            components: [ {
                first_message_id: firstMessage,
                last_message_id: lastMessage,
                comment: comment,
                type: type
            }],
            member_id: memberId,
            title: title
        }
        console.log("create highlight: ", body)
        createHighlight(body)
        setVisible(false)
        navigate("/highlights")
    }

    return (
        <Modal
            title={"Create highlight"}
            open={visible}
            width={700}
            onCancel={cancel}
            onOk={save}
            okButtonProps={{disabled: title === ""}}
        >

            <div style={{display: "flex", flexDirection: "column", alignItems: "stretch"}}>
                <FormItem label={"Title"} input={titleInput} />
                <FormItem label={"Comment"} input={commentInput} />
                <FormItem label={"Type"}
                          input={typeSelect} />
                <FormItem label={"First Message"} input={firstMessagePreview} />
                {type === THREAD ?
                    <FormItem label={"Last Message"} input={lastMessagePreview} /> :
                    null }
                <Tag style={{alignSelf: "flex-start"}}>
                    {messageCount} total message{messageCount === 1 ? "" : "s"}
                </Tag>
            </div>

        </Modal>
    );
}

function getMemberId(members, sub) {
    for (let i = 0; i < members?.resource?.length; i++) {
        const member = members.resource[i]
        if (member.auth0_sub === sub) {
            return member.user_id
        }
    }
    return ""
}
