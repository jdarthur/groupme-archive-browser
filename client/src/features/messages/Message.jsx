import React from 'react';
import {Avatar, Image} from "antd";
import PosterIdentity from "./PosterIdentity";
import LikeCount from "./LikeCount";

const MILLISECONDS_BETWEEN_MESSAGES_TO_SHOW_DATE_AGAIN = 1800000

export default function Message(props) {

    const createDate = Date.parse(props.date)

    const dateBefore = Date.parse(props.previousMessage?.date || 0)
    const timeSincePreviousPost = createDate - dateBefore
    const hideDate = (timeSincePreviousPost < MILLISECONDS_BETWEEN_MESSAGES_TO_SHOW_DATE_AGAIN)

    const fullDate = new Date(createDate).toLocaleString()
    const date = hideDate ? new Date(createDate).toLocaleTimeString() : fullDate

    const isSystem = props.user_id === "system"

    let rootColor = "black"
    let background = "white"
    let paddingTop = 5
    let paddingBottom = 5
    if (isSystem) {
        rootColor = "#595959"
        background = "#f0f0f0"
        paddingTop = 10
        paddingBottom = 10
    }

    const style = {
        // display: "flex",
        paddingBottom: paddingBottom,
        paddingTop: paddingTop,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: rootColor,
        background: props.open ? "#f5f5f5" : background,
        width: '100%',
    }

    const userAndDate = <div style={{color: "#8c8c8c", fontSize: "0.8em", marginBottom: 5}}>
        <PosterIdentity members={props.members?.resource} userId={props.user_id} name={props.name}/>
        <span>{date}</span>
    </div>

    const image = renderImage(props.attachments)

    const avatar = isSystem ? <div style={{width: 40}}/> : <div>
        <Avatar src={props.avatar_url} size={"large"}/>
    </div>

    const showLine = (!hideDate && (props.previousMessage?.user_id !== "system"))

    const topStyle = {
        color: "#8c8c8c",
        fontSize: "0.8em",
        textAlign: "center",
        padding: showLine ? 20 : 0,
        borderTop: showLine && props.previousMessage?.message_id ? "1px solid #f0f0f0" : "",
        marginTop: showLine ? 10 : 0
    }

    const text = renderTextWithMentionsAndUrlClickable(props.text,
        props.attachments, props.members?.resource || [],
        props.date, props.channelId)

    return <div>
        <div style={topStyle}>
            {!hideDate ? fullDate : null}
        </div>

        <div style={style}>

            <div style={{display: "flex"}}>
                {avatar}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    marginLeft: 10,
                    flex: 1,
                    position: "relative"
                }}>
                    {isSystem ? null : userAndDate}
                    <div style={{display: "flex", justifyContent: "space-between", alignSelf: "stretch"}}>
                        <div style={{
                            textAlign: "left",
                            paddingRight: "1em",
                            flex: 1,
                            fontSize: isSystem ? "0.8em" : "1em"
                        }} onClick={props.setOpen}>
                            {text}
                            <div style={{margin: image ? 5 : 0}}/>
                            {image}
                            <div style={{color: "#bfbfbf", fontSize: "0.8em", marginTop: props.open ? 10 : 0}}>
                                {props.open ? fullDate : null}
                            </div>
                        </div>

                        <span style={{position: "relative"}}>
                            <LikeCount likes={(props.liked_by || [])} members={props.members} date={props.date}/>
                            <span style={{position: "absolute", top: 0, right: 0, transform: "translate(100%, -25%)"}}>
                                {props.contextButton}
                            </span>

                        </span>


                    </div>

                </div>

            </div>

        </div>
    </div>

}

function renderImage(attachments) {
    if (attachments.length === 0) {
        return null
    }
    let type = null
    let url = null
    for (let i = 0; i < attachments[0].length; i++) {
        const v = attachments[0][i]
        if (v["Key"] === "type") {
            type = v["Value"]
        }
        if (v["Key"] === "url") {
            url = v["Value"]
        }
    }

    if (type === "image" && url !== null) {
        return <div>
            <Image src={url} style={{maxWidth: 'min(400px, 70vw)', maxHeight: "min(400px, 70vh)", objectFit: "cover"}}/>
        </div>
    }

    if (type === "mentions")

        return null
}

function renderWithUrlClickable(messageText) {
    const splitVersion = messageText.replace("\n", " ")
    const words = splitVersion.split(" ")
    const content = []
    let running_string = ""
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (word.includes("http://") || word.includes("https://")) {
            //console.log("Message has url: ", word)
            if (running_string.length > 0) {
                content.push(<div>{running_string}</div>)
            }

            content.push(<a href={word} target={"_blank"}> {word} </a>)
            running_string = ""
        } else {
            running_string += word + " "
        }
    }
    if (running_string.length > 0) {
        content.push(running_string)
    }
    return <div>
        {content}
    </div>
}

function renderTextWithMentionsAndUrlClickable(messageText, attachments, allMembers, postingDate, channelId) {

    let chunks = []
    const a = attachments || []

    if (a.length > 0) {
        //console.log(attachments)
        let type = null
        let userIds = null
        for (let i = 0; i < a[0].length; i++) {
            const v = a[0][i]
            //short circuit this comparison if we have already found mentions key
            if (type !== "mentions" && v["Key"] === "type") {
                type = v["Value"]
            }
            if (v["Key"] === "user_ids") {
                userIds = v["Value"]
            }
        }

        if (type === "mentions") {
            //console.log("had mentions", userIds)
            const map = {}
            for (let i = 0; i < userIds.length; i++) {
                const id = userIds[i]
                const nickname = getUsersCurrentNickname(id, allMembers, postingDate, channelId)
                map[id] = nickname
            }

            const order = getOrderOfMentions(messageText, map)
            let message = messageText
            for (let i = 0; i < order.length; i++) {
                const nickname = order[i].nickName
                message = messageText.replace(`@${nickname}`, "")
                chunks.push(<PosterIdentity members={allMembers} userId={order[i].userId} name={`@${nickname}`} blue/>)
            }

            chunks.push(message)
        }

        return chunks

    } else {
        return renderWithUrlClickable(messageText)
    }
}

function getUsersCurrentNickname(userId, allMembers, postingDate, channelId) {
    for (let i = 0; i < allMembers?.length; i++) {
        const member = allMembers[i]
        if (member.archive_member_id === userId) {
            let a = member.aliases[0].name
            for (let j = 1; j < member.aliases?.length; j++) {
                const alias = member.aliases[j]
                if (alias.created_at < postingDate && alias.channel_id === channelId) {
                    return a
                }
                if (alias.channel_id === channelId) {
                    a = alias.name
                }
            }
        }
    }
    return null
}

function getOrderOfMentions(messageText, users) {
    const order = []

    for (const [userId, nickName] of Object.entries(users)) {
        const index = messageText.indexOf(`@${nickName}`)
        order.push({userId: userId, index: index, nickName: nickName})
    }

    const output = order.sort(function (a, b) {
        if (a.index > b.index) {
            return -1
        } else if (a.index < b.index) {
            return 1
        } else {
            return 0
        }
    })

    for (let i = 0; i < output.length; i++) {
        if (output[i].index === -1) {
            console.log("Couldn't locate @-mention index in message: ", messageText, output[i])
        }
    }

    return output
}