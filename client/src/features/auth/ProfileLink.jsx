import React from "react";

import {UserOutlined} from "@ant-design/icons";
import SimpleButtonWithIconAndCorrectlyAlignedText from "../common/SimpleButtonWithIconAndCorrectlyAlignedText";


export default function ProfileLink(props) {
    let title = "Your profile"

    return (
        <SimpleButtonWithIconAndCorrectlyAlignedText
            text={title}
            icon={<UserOutlined />}
            loading={props.isFetching}
            style={{marginBottom: 10}}
            disabled={props.disabled}
            onClick={props.onClick}
        />
    );
};
