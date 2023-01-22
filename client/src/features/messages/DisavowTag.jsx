import React from 'react';
import {Tag, Tooltip} from "antd";

export default function DisavowTag(props) {

    if (props.disavowal) {
        const d = props.disavowal
        console.log(props)

        const createDate = Date.parse(d.created_at)
        const date = new Date(createDate).toLocaleDateString()
        const time = new Date(createDate).toLocaleTimeString()

        const verb = d.disavow ? "disavowed" : "reavowed"

        let title = `${props.name} ${verb} this message on ${date} at ${time}`
        let context = null
        if (d.comment) {
            title += " with the comment: "
            context = <div style={{fontStyle: "italic", marginLeft: 10}}>{d.comment}</div>
        }

        const fullTitle = <div style={{maxWidth: 200}}>
            {title}
            {context}
        </div>

        return <Tooltip title={fullTitle}>
            <Tag style={{margin: 10, color: "#595959"}}> User has {verb} this message. </Tag>
        </Tooltip>
    }
    return null
}