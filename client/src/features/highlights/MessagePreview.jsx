import React, {useState} from 'react';
import {Spin} from "antd";
import {Message} from "../messages/Message";
import {useGetMessageByIdQuery} from "../../services/api";
import SimpleButtonWithIconAndCorrectlyAlignedText from "../common/SimpleButtonWithIconAndCorrectlyAlignedText";
import {EditOutlined} from "@ant-design/icons";
import ThreadSelect from "./ThreadSelect";
import {useAuth} from "../../app/store";

export default function MessagePreview({messageId, setMessageId, firstMessageId, disabled}) {

    const [threadSelectOpen, setThreadSelectOpen] = useState(false)
    const noToken = !useAuth().token
    const {data, isFetching} = useGetMessageByIdQuery(messageId, {skip: !messageId || noToken})

    if (isFetching) {
        return <Spin size={"small"}/>
    }

    const message = data?.resource

    const onButtonClick = () => {
        setThreadSelectOpen(true)
    }

    const save = (value) => {
        setMessageId(value)
        setThreadSelectOpen(false)
    }

    const m = messageId ?
        <Message message_id={messageId}
                 name={message?.poster_name}
                 text={message?.message_text}
                 channelId={message?.channel_id}
                 user_id={message?.user_id}
                 date={message?.date}
                 liked_by={message?.liked_by}
                 avatar_url={message?.avatar_url}
                 disavowal={message?.disavowal}
                 attachments={message?.attachments}
                 hideTopDate
        /> : null

    const buttonText = messageId ? "Change" : "Select"

    return (<span>
            {m}
            <SimpleButtonWithIconAndCorrectlyAlignedText icon={<EditOutlined/>}
                                                         text={buttonText}
                                                         type={"primary"}
                                                         style={{marginLeft: 15}}
                                                         onClick={onButtonClick}
                                                         disabled={disabled}
            />
            <ThreadSelect firstMessageId={firstMessageId} visible={threadSelectOpen}
                          cancel={() => setThreadSelectOpen(false)} save={save}/>
    </span>

    );
}
