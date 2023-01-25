import React, {useState} from 'react';
import {useGetHighlightsQuery, useGetMembersQuery} from "../../services/api";
import {Breadcrumb, Spin} from "antd";
import {useAuth} from "../../app/store";
import Highlight from "./Highlight";
import {useSearchParams} from "react-router-dom";
import CreateHighlight from "./CreateHighlight";
import LoginNeeded from "../auth/LoginNeeded";

export default function Highlights() {
    const noToken = !useAuth().token
    const {data, isFetching} = useGetHighlightsQuery(undefined, {skip: noToken})
    const {data: members} = useGetMembersQuery(undefined, {skip: noToken})

    const [params] = useSearchParams();
    const create = params?.get("create") === "true"
    const firstMessage = params?.get("start")

    const [showModal, setShowModal] = useState(create)

    const highlights = data?.resource?.map((highlight) => (
        <Highlight key={highlight.highlight_id}
                   highlightId={highlight.highlight_id}
                   title={highlight.title}
                   components={highlight.components}
                   member_id={highlight.member_id}
                   members={members || []}
                   created_at={highlight.created_at}
    />))

    const content = <div>
        {isFetching ? <Spin size={"large"} /> : highlights}
        <CreateHighlight visible={showModal}
                         firstMessageId={firstMessage}
                         cancel={() => setShowModal(false)}
                         setVisible={setShowModal}
        />
    </div>
    return (
        <div style={{padding: 10}}>
            <Breadcrumb>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Highlights</Breadcrumb.Item>
            </Breadcrumb>
            {noToken ? <LoginNeeded /> : content}
        </div>
    );
}
