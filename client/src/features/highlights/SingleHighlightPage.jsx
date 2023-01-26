import React from 'react';
import {useGetHighlightByIdQuery, useGetMembersQuery} from "../../services/api";
import {getIcon, getMember} from "./Highlight";
import {useAuth} from "../../app/store";
import {Breadcrumb, Spin} from "antd";
import {Link, useParams} from "react-router-dom";
import HighlightComponent from "./HighlightComponent";

export default function SingleHighlightPage() {
    let {highlightId} = useParams();

    const noToken = !useAuth().token

    const {data, isFetching} = useGetHighlightByIdQuery(highlightId, {skip: noToken})
    const {data: members} = useGetMembersQuery(undefined, {skip: noToken})

    const highlight = data?.resource

    if (isFetching) {
        return <Spin size={"large"}/>
    }

    const mem = getMember(members?.resource || [], highlight?.member_id)

    const c = highlight?.components?.map((component, i) => (
        <HighlightComponent key={`component-${i}`}
                            members={members}
                            highlightId={highlightId}
                            type={component.type}
                            comment={component.comment}
                            first_message_id={component.first_message_id}
                            last_message_id={component.last_message_id}
                            //avatar={avatar(mem, 35)}
                            expanded={true}
        />
    ))

    const user = getIcon(mem, highlight?.created_at, 30)

    return (
        <div style={{padding: 10, maxWidth: "min(700px, 90vw)"}}>
            <Breadcrumb>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Link to={"/highlights"}>Highlights</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{highlightId}</Breadcrumb.Item>
            </Breadcrumb>
            <span style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", padding: 10}}>
                <span style={{fontSize: "1.5em", fontWeight: "bold", marginRight: 100}}>
                    {highlight?.title}
                </span>
                <span style={{paddingTop: 10, paddingBottom: 10, fontSize: "00.9em"}}>{user}</span>
            </span>


            <div style={{paddingLeft: 20}}>
                {c}
            </div>

        </div>
    );
}
