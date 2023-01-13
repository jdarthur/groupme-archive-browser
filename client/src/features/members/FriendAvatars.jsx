
import React, {useState} from 'react';
import {Button} from "antd";
import FixedSizeImage from "../common/FixedSizeImage";
import NamesList from "./NamesList";

export default function FriendAvatars(props) {
    const firstUrl = props.aliases[0].avatar_url
    const unique = uniqueAvatars(props.aliases)

    const [url, setUrl] = useState(firstUrl)
    const [nicknames, setNicknames] = useState(unique[0].names)
    const [index, setIndex] = useState(0)

    const totalCount = unique.length || 0;

    const next = () => {
        const newIndex = index + 1
        setIndex(newIndex)
        setUrl(unique[newIndex].avatar_url)
        setNicknames(unique[newIndex].names)
    }

    const prev = () => {
        const newIndex = index - 1
        setIndex(newIndex)
        setUrl(unique[newIndex].avatar_url)
        setNicknames(unique[newIndex].names)
    }

    const nameList = <NamesList names={nicknames || []} />

    return <div style={{padding: 25}}>
        <FixedSizeImage src={url} width={500} height={500} alt={`avatar #${index + 1}`} />
        <div style={{display: "flex", flexWrap: "wrap", width: 500, height: 100, padding: 10, justifyContent: "center"}}>
            {nameList}
        </div>
        <Button disabled={index === 0} onClick={prev}> Previous </Button>
        <span style={{marginLeft: 15, marginRight: 15}}>
            Showing {index + 1} of {totalCount}
        </span>
        <Button disabled={index === totalCount - 1} onClick={next}> Next </Button>
    </div>
}

function uniqueAvatars(aliases) {
    const ret = []
    for (let i = 0; i < aliases.length; i++) {
        const url = aliases[i].avatar_url
        const name = aliases[i].name

        let found = false
        let j = 0
        for (j = 0; j < ret.length; j++) {
            if (ret[j].avatar_url === url) {
                found = true
                break;
            }
        }

        if (!found) {
            const val = {...aliases[i]}
            val["names"] = [name]
            ret.push(val)
        } else {
            ret[j].names.push(name)
        }
    }
    return ret
}


