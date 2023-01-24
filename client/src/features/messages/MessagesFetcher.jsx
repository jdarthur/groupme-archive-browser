import React, {useCallback, useEffect} from 'react';
import {CONTROVERSIAL, FROM_A_DATE, FROM_THE_BOTTOM, FROM_THE_TOP, NIGHT_TIME, RANDOM, RANDOM_HOT} from "./Messages";
import {
    useLazyGetControversialMessageQuery,
    useLazyGetMessagesFromDateQuery,
    useLazyGetMessagesQuery, useLazyGetNighttimeQuery,
    useLazyGetRandomMessagesQuery
} from "../../services/api";

export default function MessagesFetcher({type, date, setValid, valid, channelId,
                                         setIsFetching, setShowMessagesBeforeButton,
                                         setShowMessagesAfterButton, setMainMessagesView}) {

    const [getFromTopOrBottom] = useLazyGetMessagesQuery()
    const [getRandom] = useLazyGetRandomMessagesQuery()
    const [getFromADate] = useLazyGetMessagesFromDateQuery()
    const [getControversial] = useLazyGetControversialMessageQuery()
    const [getNighttime] = useLazyGetNighttimeQuery()

    const getMessages = useCallback(async (type, date) => {
        const args = {channelId: channelId}
        if (type === FROM_THE_BOTTOM) {
            args.query = "?reverse=true"
        } else if (type === FROM_THE_TOP) {
            args.query = ""
        } else if (type === RANDOM) {
            args.query = ""
        } else if (type === RANDOM_HOT) {
            args.query = "?hot=true"
        } else if (type === FROM_A_DATE) {
            args.date = date
        }

        setIsFetching(true)
        let resp = null
        if (type === FROM_THE_TOP || type === FROM_THE_BOTTOM) {
            resp = await getFromTopOrBottom(args)
        } else if (type === RANDOM || type === RANDOM_HOT) {
            resp = await getRandom(args)
        } else if (type === FROM_A_DATE) {
            resp = await getFromADate(args)
        } else if (type === CONTROVERSIAL) {
            resp = await getControversial(args)
        } else if (type === NIGHT_TIME) {
            resp = await getNighttime(args)
        }
        else {
            //console.log("Unexpected view type: ", type)
            return
        }

        if (resp.error) {
            console.log("got an error: ", resp.error)
        } else {
            const data = resp?.data.resource
            //console.log(data)
            if (data?.length > 0) {
                setShowMessagesBeforeButton(!data[0].end_of_the_line)
                setShowMessagesAfterButton(!data[data.length - 1].end_of_the_line)
            }
            setMainMessagesView(data)
        }
        setIsFetching(false)
    }, [getNighttime, getFromTopOrBottom, getFromADate, getRandom, getControversial, channelId,
         setIsFetching, setShowMessagesAfterButton, setShowMessagesBeforeButton, setMainMessagesView])


    useEffect(() => {
        getMessages(type, date)
        setValid(true)
    }, [type, date, valid, setValid, getMessages]);


    return <div/>

}