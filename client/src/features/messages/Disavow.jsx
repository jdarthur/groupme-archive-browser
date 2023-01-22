import React, {useState} from 'react';
import {Button, Input, Popover, Switch} from "antd";
import {useDisavowMessageMutation, useUndisavowMessageMutation} from "../../services/api";
import {DeleteOutlined} from "@ant-design/icons";

export default function Disavow(props) {
    const [disavow, setDisavow] = useState(true)
    const [comment, setComment] = useState("")
    const [visible, setVisible] = useState(false)

    const [submit] = useDisavowMessageMutation()
    const [undisavow] = useUndisavowMessageMutation()

    const onSubmit = () => {
        const body = {
            disavow: disavow,
            comment: comment,
        }
        console.log(body)
        submit({message_id: props.message_id, body: body})
        onCancel()
    }

    const onCancel = () => {
        setDisavow(true)
        setComment("")
        setVisible(false)
    }

    const open = (event) => {
        console.log(open)
        event.stopPropagation()
        setVisible(true)
    }

    const onDelete = () => {
        undisavow(props.message_id)
        onCancel()
    }

    const trashCan = props.existing ? <DeleteOutlined onClick={onDelete} style={{marginLeft: 10}}/> : null
    const popoverTitle = <span>
        {disavow ? "Disavow this message": "Avow this message"}
        {trashCan}
    </span>

    const content = <div onClick={(event) => event.stopPropagation()}
                         style={{display: "flex", flexDirection: 'column', alignItems: "flex-end"}}>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10, alignSelf: "stretch"}}>
            Disavow?
            <Switch checked={disavow} onChange={(value) => setDisavow(value)}/>
        </div>
        <div>
            <Input.TextArea value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            style={{width: 200}}
                            placeholder={"Add a comment (optional)"}/>
        </div>
        <span style={{marginTop: 10}}>
            <Button style={{marginRight: "0.5em"}}
                    onClick={() => setVisible(false)}>
                Cancel
            </Button>
            <Button type={"primary"} onClick={onSubmit}>
                Save
            </Button>
        </span>

    </div>


    return <Popover title={popoverTitle}
                    content={content}
                    arrowPointAtCenter={true}
                    open={visible}
    >
        <Button style={{marginLeft: 10}} onClick={open}> Disavow </Button>
    </Popover>

}