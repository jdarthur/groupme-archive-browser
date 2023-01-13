import React, {useState} from 'react';
import {Button, Collapse, DatePicker} from "antd";
import {
    ToolOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    RetweetOutlined,
    FireOutlined,
    CalendarOutlined
} from "@ant-design/icons"
import {FROM_THE_BOTTOM, FROM_THE_TOP} from "./Messages";
import AlignedIconAndText from "../common/AlignedIconAndText";
import SimpleButtonWithIconAndCorrectlyAlignedText from "../common/SimpleButtonWithIconAndCorrectlyAlignedText";

const {Panel} = Collapse;

export default function SearchTools(props) {
    const toolsLabel = <AlignedIconAndText icon={<ToolOutlined />} text={"Search tools"} />

    const onChange  = (date, dateString) => {
        props.setDate(dateString)
    };

    return <Collapse defaultActiveKey={['1']} bordered={false} style={{borderBottom: "1px solid #f0f0f0"}}>
        <Panel header={toolsLabel} key="1">
            <div style={{padding: 5, display: "flex", flexWrap: "wrap", gap: 5}}>
                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<ArrowUpOutlined />}
                    text={"Start from the top"}
                    onClick={() => props.clickFrom(FROM_THE_TOP)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<ArrowDownOutlined />}
                    text={"Start from the bottom"}
                    onClick={() => props.clickFrom(FROM_THE_BOTTOM)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<RetweetOutlined />}
                    text={"Random"}
                    onClick={() => props.clickRandom(false)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<FireOutlined />}
                    text={"Hot"}
                    onClick={() => props.clickRandom(true)} />

                <DatePicker placeholder={"From a date"} onChange={onChange} />

            </div>
        </Panel>
    </Collapse>

}