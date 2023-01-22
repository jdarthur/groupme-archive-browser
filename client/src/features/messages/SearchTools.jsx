import React from 'react';
import {Collapse, DatePicker} from "antd";
import {
    ToolOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    RetweetOutlined,
    FireOutlined,
    WarningOutlined, StarOutlined
} from "@ant-design/icons"
import {CONTROVERSIAL, FROM_THE_BOTTOM, FROM_THE_TOP, NIGHT_TIME, RANDOM, RANDOM_HOT} from "./Messages";
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
                    text={"From the top"}
                    onClick={() => props.clickType(FROM_THE_TOP)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<ArrowDownOutlined />}
                    text={"From the bottom"}
                    onClick={() => props.clickType(FROM_THE_BOTTOM)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<RetweetOutlined />}
                    text={"Random"}
                    onClick={() => props.clickType(RANDOM)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<FireOutlined />}
                    text={"Hot"}
                    onClick={() => props.clickType(RANDOM_HOT)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<WarningOutlined />}
                    text={"Controversial"}
                    onClick={() => props.clickType(CONTROVERSIAL)} />

                <SimpleButtonWithIconAndCorrectlyAlignedText
                    icon={<StarOutlined />}
                    text={"Nighttime"}
                    onClick={() => props.clickType(NIGHT_TIME)} />

                <DatePicker placeholder={"From a date"} onChange={onChange} />

            </div>
        </Panel>
    </Collapse>

}