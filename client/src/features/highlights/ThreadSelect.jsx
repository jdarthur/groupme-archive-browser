import React, {useState} from 'react';
import {Message} from "../messages/Message";
import {Modal, Spin} from "antd";
import {useGetMessagesFromMessageIdQuery} from "../../services/api";
import SelectMessage from "./SelectMessage";

export default function ThreadSelect({firstMessageId, visible, cancel, save, setTotalMessages}) {

    const [messageId, setMessageId] = useState(null)
    const [index, setIndex] = useState(0)

    const {data, isFetching} = useGetMessagesFromMessageIdQuery({messageId: firstMessageId, query: ""}, {skip: !firstMessageId})

    if (isFetching) {
        return <Spin size={"large"} style={{margin: 50}}/>
    }

    const m = data?.resource || []
    const mView = []

    const selectMessage = (messageId, index) => {
        setMessageId(messageId)
        setIndex(index)
    }

    for (let i = 0; i < m.length; i++) {
        const message = m[i]
        const previousMessage = i > 0 ? m[i - 1] : {}
        mView.push(<span>

            <span style={{display: "inline-flex", alignItems: "flex-start"}}>

                <SelectMessage messageId={message.message_id}
                               setSelected={selectMessage}
                               selected={i <= index}
                               index={i} />

                <Message
                    key={message.message_id}
                    message_id={message.message_id}
                    name={message.poster_name}
                    date={message.date}
                    text={message.message_text}
                    avatar_url={message.avatar_url}
                    user_id={message.user_id}
                    attachments={message.message_attachments}
                    previous_date={previousMessage?.date}
                    previous_user_id={previousMessage?.user_id}
                    previous_message_id={previousMessage?.message_id}
                    liked_by={message.liked_by}
                    channelId={message.channel_id}
                    disavowal={message.disavowal}
                    hideTopDate
                    color={i <= index ? "" : "rgba(0,0,0, 0.25)"}
                />

            </span>

        </span>)
    }


    return <Modal
        title={"Select thread"}
        open={visible}
        width={500}
        onCancel={cancel}
        onOk={() => save(messageId, index + 1)}>

        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            maxHeight: '80vh',
            overflowY: "auto",
            wordBreak: "break-all"
        }}>
            {mView}
        </div>

    </Modal>
}