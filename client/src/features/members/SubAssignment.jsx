import React, {useState} from 'react';
import {useGetMembersQuery, useUpdateAuth0SubMutation} from "../../services/api";
import {useAuth} from "../../app/store";
import {Avatar, Breadcrumb, Card, Input, Modal, Spin, Tag} from "antd";
import SimpleButtonWithIconAndCorrectlyAlignedText from "../common/SimpleButtonWithIconAndCorrectlyAlignedText";
import {EditOutlined} from "@ant-design/icons";
import InlineStatistic from "../common/InlineStatistic";
import FormItem from "../common/FormItem";

export default function SubAssignment() {
    const noToken = !useAuth().token
    const {data, isFetching} = useGetMembersQuery(undefined, {skip: noToken})

    const [updateSub] = useUpdateAuth0SubMutation()

    const [modalVisible, setModalVisible] = useState(false)
    const [subValue, setSubValue] = useState("")
    const [memberId, setMemberId] = useState("")
    const [memberName, setMemberName] = useState("")

    if (isFetching) {
        return <Spin size={"large"}/>
    }

    const clickEdit = (memberId, memberName) => {
        setMemberId(memberId)
        setMemberName(memberName)
        setModalVisible(true)
    }

    const submit = () => {
        const body = {
            member_id: memberId,
            auth0_sub: subValue
        }
        console.log("update sub", body)
        updateSub(body)
        cancel()
    }

    const cancel = () => {
        setSubValue("")
        setMemberId("")
        setModalVisible(false)
    }

    const members = data?.resource || []

    const nameList = members.map((member) => (
        <Card title={member?.name}
              extra={<Avatar src={member?.image_url}/>}
              size={"small"}
              style={{width: 250, height: 150, margin: 10}}>
            <InlineStatistic name={"Auth0 sub"} value={<Tag>{member?.auth0_sub ? member?.auth0_sub : "none"}</Tag>}/>
            <SimpleButtonWithIconAndCorrectlyAlignedText
                icon={<EditOutlined/>}
                text={"Edit"}
                type={"primary"}
                style={{margin: 10, float: "right"}}
                onClick={() => clickEdit(member?.user_id, member?.name)}/>
        </Card>))

    const editModal = (
        <Modal open={modalVisible}
               title={"Update sub value"}
               onOk={submit}
               onCancel={cancel}>

            <FormItem input={<Input value={memberName} disabled />} label={"User"}/>
            <FormItem input={<Input value={subValue} onChange={(event) => setSubValue(event.target.value)}/>}
                      label={"Auth0 Sub"}/>
        </Modal>)


    return <div style={{padding: 10}}>
        <Breadcrumb>
            <Breadcrumb.Item>Admin</Breadcrumb.Item>
            <Breadcrumb.Item>Sub Assignment</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{display: "flex", flexWrap: "wrap", maxWidth: 1000}}>
            {nameList}
        </div>

        {editModal}
    </div>

}