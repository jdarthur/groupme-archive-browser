import React, {memo} from 'react';
import {Avatar, Image} from "antd";
import PosterIdentity from "./PosterIdentity";
import LikeCount from "./LikeCount";
import {useAuth0} from "@auth0/auth0-react";
import Disavow from "./Disavow";
import DisavowTag from "./DisavowTag";
import DateTime from "../common/DateTime";
import PreMessageTimestamp from "./PreMessageTimestamp";
import {useGetMembersQuery} from "../../services/api";
import {useAuth} from "../../app/store";
import ShareMessage from "./ShareMessage";
import CreateHighlight from "./CreateHighlight";


export function Message({ date, previous_date, previous_message_id,
                   user_id, hideTopDate, name, attachments,
                   channelId, avatar_url, message_id, text,
                   disavowal, setOpen, open, liked_by, contextButton,
                   previous_user_id, end_of_the_line, color }) {

    const noToken = !useAuth().token
    const {data: members} = useGetMembersQuery(undefined, {skip: noToken})

    const {user} = useAuth0()
    let sub = null
    if (user) {
        sub = user.sub
    }

    const fullDate = <DateTime date={date} full />
    const time = <DateTime date={date} />

    const isSystem = user_id === "system"

    let rootColor = color || "black"
    let paddingTop = 5
    let paddingBottom = 5
    if (isSystem) {
        rootColor = "#595959"
        paddingTop = 10
        paddingBottom = 10
    }

    const myPost = postedByMe(members?.resource || [], user_id, sub)

    const style = {
        paddingBottom: paddingBottom,
        paddingTop: paddingTop,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: rootColor,
        background: myPost ? "#e6f7ff" : "",
        width: '100%',
    }

    const needFullDateInline = hideTopDate && !previous_message_id
    const datetime = needFullDateInline ? fullDate : time

    const userAndDate = <div style={{color: "#8c8c8c", fontSize: "0.8em", marginBottom: 5}}>
        <PosterIdentity members={members?.resource} userId={user_id} name={name}/>
        <span>{datetime}</span>
    </div>

    const image = renderImage(attachments)

    const avatar = isSystem ? <div style={{width: 40}}/> : <div>
        <Avatar src={avatar_url} size={"large"} style={{marginLeft: 5}}/>
    </div>

    const textRender = renderTextWithMentionsAndUrlClickable(text,
        attachments, members?.resource || [],
        date, channelId, message_id)

    const avow = myPost ? <Disavow message_id={message_id} existing={disavowal} /> : null
    const share = <ShareMessage message_id={message_id} channelId={channelId} />
    const highlight = <CreateHighlight message_id={message_id} />

    return <div>
        <PreMessageTimestamp date={date}
                             previous_message_id={previous_message_id}
                             previous_date={previous_date}
                             previous_user_id={previous_user_id}
                             hideTopDate={hideTopDate}
                             user_id={user_id}
                             end_of_the_line={end_of_the_line} />

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
                            fontSize: isSystem ? "0.8em" : "1em",
                        }} onClick={() => setOpen(message_id)}>
                            {textRender}
                            <div style={{margin: image ? 5 : 0}}/>
                            {image}
                            <div style={{color: "#bfbfbf", fontSize: "0.8em", marginTop: open ? 10 : 0}}>
                                {/*{props.open ? fullDate : null}*/}
                                {open ? avow : null}
                                {open ? share : null}
                                {open ? highlight : null}
                            </div>
                        </div>

                        <span style={{position: "relative"}}>
                            <LikeCount likes={(liked_by || [])} members={members} date={date}/>
                            <span style={{position: "absolute", top: 0, right: 0, transform: "translate(100%, -25%)"}}>
                                {contextButton}
                            </span>

                        </span>
                    </div>
                    <DisavowTag name={name} disavowal={disavowal} />
                </div>

            </div>

        </div>
    </div>

}

function renderImage(attachments) {
    if (!attachments || attachments?.length === 0) {
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

function renderWithUrlClickable(messageText, messageId) {
    if (!messageText || !messageId) {
        return null
    }

    const words = messageText.split(" ")
    const content = []
    let running_string = ""
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (word.includes("http://") || word.includes("https://")) {
            //console.log("Message has url: ", word)
            if (running_string.length > 0) {
                content.push(<div key={`${messageId}-text-${i}`}>{running_string}</div>)
            }

            content.push(<a href={word} key={`${messageId}-url-${i}`} target={"_blank"} rel={"noreferrer"}> {word} </a>)
            running_string = ""
        } else {
            running_string += word + " "
        }
    }
    if (running_string.length > 0) {
        content.push(lineBreakRawText(running_string))
    }
    return <div>
        {content}
    </div>
}

function renderTextWithMentionsAndUrlClickable(messageText, attachments, allMembers, postingDate, channelId, messageId) {

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
                map[id] = getUsersCurrentNickname(id, allMembers, postingDate, channelId)
            }

            const order = getOrderOfMentions(messageText, map)
            let message = messageText
            for (let i = 0; i < order.length; i++) {
                const nickname = order[i].nickName
                message = messageText.replace(`@${nickname}`, "")
                chunks.push(<PosterIdentity key={order[i].userId} members={allMembers} userId={order[i].userId} name={`@${nickname}`} blue/>)
            }

            chunks.push(<span key={"message-text-"}>{lineBreakRawText(message)}</span>)
        }

        if (type === "event") {
            return messageText
        }

        return chunks

    } else {
        return renderWithUrlClickable(messageText, messageId)
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

function postedByMe(members, targetMemberId, targetSub) {
    for (let i = 0; i < members.length; i++) {
        const thisUserId = members[i].archive_member_id
        const thisSub = members[i].auth0_sub
        if (thisUserId === targetMemberId && thisSub === targetSub) {
            return true
        }
    }
    return false
}

function lineBreakRawText(message) {
    if (!message) {
        return null
    }
    const segments = message.split("\n")

    return segments.map((part) => <div>
        {part}
    </div>)
}

function isMessageEqual(oldProps, newProps) {
    if (oldProps.message_id !== newProps.message_id) {
        return false
    }
    if (oldProps.open !== newProps.open) {
        return false
    }
    return true
}

export const MemoMessage = memo(Message, isMessageEqual);