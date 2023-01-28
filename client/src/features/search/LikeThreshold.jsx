import React, {useState} from 'react';
import {Button, Popover} from "antd";
import {HeartOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";
import SimpleButtonWithIconAndCorrectlyAlignedText from "../common/SimpleButtonWithIconAndCorrectlyAlignedText";


export default function LikeThreshold({onSearch}) {
    const [open, setOpen] = useState(false)
    const [threshold, setThreshold] = useState(3)

    const increment = (decrement) => {
        setThreshold(decrement ? threshold - 1 : threshold + 1)
    }

    const submit = () => {
        setOpen(false)
        onSearch(threshold)
    }

    const content = <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
        <span style={{padding: 10, display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
            <div>Minimum likes:</div>
            <span style={{paddingLeft: "1em"}}>
                <LeftOutlined disabled={threshold === 1} onClick={() => increment(true)}/>
                <span style={{padding: "0px 10px"}}>{threshold}</span>
                <RightOutlined onClick={() => increment(false)}/>
            </span>
        </span>

        <Button type={"primary"} onClick={submit}
                style={{alignSelf: "flex-end", marginTop: 10}}>

            Search
        </Button>
    </div>

    return <Popover content={content}
                    title={"Search by like count"}
                    placement={"bottomRight"}
                    open={open} >
        <SimpleButtonWithIconAndCorrectlyAlignedText icon={<HeartOutlined/>} text={"Like threshold"}
                                                     style={{marginLeft: "1em"}} onClick={() => setOpen(true)}/>
    </Popover>
}

