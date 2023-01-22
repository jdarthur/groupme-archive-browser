import React, {useState} from 'react';
import {Button} from "antd";
import {useLazyGetMessagesFromMessageIdQuery} from "../../services/api";

export default function ShowMoreButton(props) {

    const [isFetching, setIsFetching] = useState(false)
    const [get] = useLazyGetMessagesFromMessageIdQuery()

    const onClick = async () => {
        if (props.messageId === null) {
            return
        }

        setIsFetching(true)

        const args = {messageId: props.messageId, query: props.before ? "?before=true" : ""}
        const resp = await get(args)
        if (resp.error) {
            console.log("got an error: ", resp.error)
        } else {
            const data = resp?.data.resource
            if (data?.length > 0) {
                if (props.before) {
                    props.addMessagesBefore(data)
                } else {
                    props.addMessagesAfter(data)
                }
            }
        }
        setIsFetching(false)
    }

    return <div style={{display: "flex", justifyContent: "center", padding : 10}}>
        <Button loading={isFetching} onClick={onClick}> Show more </Button>
    </div>

}