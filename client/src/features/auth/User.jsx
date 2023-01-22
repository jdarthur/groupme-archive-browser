import React from "react";

import {Divider, Popover} from 'antd'
import LogoutButton from "./Logout2";
import {useAuth0} from "@auth0/auth0-react";
import {UserOutlined} from "@ant-design/icons";
import FixedSizeImage from "../common/FixedSizeImage";
import ProfileLink from "./ProfileLink";
import {useGetMemberByAuth0SubQuery} from "../../services/api";
import {useNavigate} from "react-router-dom";


const User = () => {
    const {user} = useAuth0();
    let navigate = useNavigate()

    const {name, sub, picture} = user;

    const {data, isFetching} = useGetMemberByAuth0SubQuery(encodeURIComponent(sub), {skip: !sub})
    let memberId = ""
    if (data?.resource?.length > 0) {
        memberId = data.resource[0].user_id
    }

    const clickProfile = () => {
        let page = "/friends/" + memberId
        navigate(page)
    }


    const content = <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
        <span>
            <FixedSizeImage width={40} height={40} src={picture}/>
            <span style={{marginLeft: '0.5em'}}>
                {name}
            </span>
        </span>
        <Divider />

        <ProfileLink isFetching={isFetching} disabled={memberId === ""} onClick={clickProfile} member_id={memberId}/>

        <LogoutButton style={{}}/>
    </div>

    return (
        <Popover content={content} trigger="click" placement="bottomRight">
            <span>
                <UserOutlined/>
                <span style={{marginLeft: 5}}>{name}</span>
            </span>
        </Popover>
    );
};

export default User;