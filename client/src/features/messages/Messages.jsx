import React, {useLayoutEffect, useState} from 'react';
import {useParams, useSearchParams} from "react-router-dom";

import MessagesFetcher from "./MessagesFetcher";
import SearchTools from "./SearchTools";
import ListOfMessages from "./ListOfMessages";
import ShowMoreButton from "./ShowMoreButton";
import {useGetMessagesDefaultQuery} from "../../services/api";
import {useAuth} from "../../app/store";

export const DEFAULT_VIEW = "default view"
export const FROM_THE_TOP = "from the top"
export const FROM_THE_BOTTOM = "from the bottom"
export const RANDOM = "random message"
export const RANDOM_HOT = "random >1 like message"
export const FROM_A_DATE = "from a date"
export const CONTROVERSIAL = "controversial"
export const NIGHT_TIME = "night time"

export const rootMessagesStyle = {
    maxWidth: 'min(700px, 100vw)',
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    height: '100%'
}

export default function Messages() {
    let {channelId} = useParams();
    const [params] = useSearchParams();
    const start = params?.get("start")

    const noToken = !useAuth().token

    const [viewType, setViewType] = useState(DEFAULT_VIEW)
    const [date, setDate] = useState("")
    const [primaryMessages, setPrimaryMessages] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [messagesBefore, setMessagesBefore] = useState([]) // list of messages before the primary MessagesView
    const [messagesAfter, setMessagesAfter] = useState([]) // list of messages after the primary MessageView
    const [valid, setValid] = useState(true)

    const [lastScrollHeight, setLastScrollHeight] = useState(0)

    // Should we show the "Load More" button at the start of the message list?
    // In other words, is the first message in the message list the first message in the channel?
    const [showMessagesBeforeButton, setShowMessagesBeforeButton] = useState(!!start)

    // Should we show the "Load More" button at the end of the message list
    // In other words, is the last message in the message list the last message in the channel?
    const [showMessagesAfterButton, setShowMessagesAfterButton] = useState(true)

    useLayoutEffect(() => {
        const x = document.getElementById("messages-root")
        if (x) {
            const newScrollHeight = x.scrollHeight
            if (lastScrollHeight !== 0) {
                const diff = newScrollHeight - lastScrollHeight
                console.log(`added ${diff} pixels to messages view`)
                x.scrollTo(0, diff)
                setLastScrollHeight(newScrollHeight)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messagesBefore])

    const args = {
        apiBase: start ? "/messages/around/" : "/channels/",
        messageId: start ? start : null,
        channelId: start ? null : channelId,
        endSegment: start ? "" : "messages",
        query: start ? "?retainMessageId=true" : ""
    }

    const {data: defaultData, isFetching: isDefaultFetching} = useGetMessagesDefaultQuery(args, {skip: noToken})

    const prependMessages = (listOfMessages) => {
        const x = document.getElementById("messages-root")
        setLastScrollHeight(x.scrollHeight)
        const messages = [...listOfMessages]
        messages.push(...messagesBefore)
        setMessagesBefore(messages)
        setShowMessagesBeforeButton(!messages[0].end_of_the_line)
    }

    const appendMessages = (listOfMessages) => {
        const messages = [...messagesAfter]
        messages.push(...listOfMessages)
        setMessagesAfter(messages)
        setShowMessagesAfterButton(!messages[messages.length - 1].end_of_the_line)
    }

    const clearBeforeAfter = () => {
        setMessagesBefore([])
        setMessagesAfter([])
    }

    const clickDate = (date) => {
        clearBeforeAfter()
        setDate(date)
        if (viewType !== FROM_A_DATE) {
            setViewType(FROM_A_DATE)
        }
    }

    const clickType = (type) => {
        clearBeforeAfter()
        if (viewType === type) {
            setValid(false)
        }
        setViewType(type)
    }

    let view = <MessagesFetcher
        type={viewType}
        channelId={channelId}
        date={date}
        setShowMessagesBeforeButton={setShowMessagesBeforeButton}
        setShowMessagesAfterButton={setShowMessagesAfterButton}
        setMainMessagesView={setPrimaryMessages}
        setIsFetching={setIsFetching}
        valid={valid}
        setValid={setValid}
    />

    const middleData = (viewType === DEFAULT_VIEW) ? [...(defaultData?.resource || [])] : [...primaryMessages]

    const fetching = (viewType === DEFAULT_VIEW) ? isDefaultFetching : isFetching

    const firstMessageId = getFirstMessageId(messagesBefore, middleData, viewType)
    const lastMessageId = getLastMessageId(messagesAfter, middleData, view)


    const allMessages = [...messagesBefore, ...middleData, ...messagesAfter]


    return <div style={rootMessagesStyle}>
        <SearchTools clickType={clickType}
                     setDate={clickDate}/>

        {view}

        <ListOfMessages messages={allMessages} isFetching={fetching}
                        showMoreBefore={showMessagesBeforeButton ?
                            <ShowMoreButton addMessagesBefore={prependMessages}
                                            messageId={firstMessageId}
                                            isFetching={fetching}
                                            before key={"show-more-before"}/> :
                            null}

                        showMoreAfter={showMessagesAfterButton ?
                            <ShowMoreButton addMessagesAfter={appendMessages}
                                            messageId={lastMessageId}
                                            isFetching={fetching}
                                            key={"show-more-after"}
                            /> :
                            null}/>

        <div style={{margin: 5}}/>
    </div>

}

function getFirstMessageId(messagesBefore, primaryMessages, viewType) {
    let firstMessageId = null
    if (messagesBefore.length > 0) {
        firstMessageId = messagesBefore[0].message_id
    } else if (primaryMessages.length > 0) {
        if (viewType === FROM_THE_BOTTOM) {
            firstMessageId = primaryMessages[primaryMessages.length - 1].message_id
        } else {
            firstMessageId = primaryMessages[0].message_id
        }
    }

    return firstMessageId
}

function getLastMessageId(messagesAfter, primaryMessages) {
    let lastMessageId = null
    if (messagesAfter.length > 0) {
        lastMessageId = messagesAfter[messagesAfter.length - 1].message_id
    } else if (primaryMessages.length > 0) {
        lastMessageId = primaryMessages[primaryMessages.length - 1].message_id
    }

    return lastMessageId
}
