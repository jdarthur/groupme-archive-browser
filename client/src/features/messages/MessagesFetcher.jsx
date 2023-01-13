import React, {useEffect} from 'react';
import {FROM_A_DATE, FROM_THE_BOTTOM, FROM_THE_TOP, RANDOM, RANDOM_HOT} from "./Messages";
import {
    useLazyGetMessagesFromDateQuery,
    useLazyGetMessagesQuery,
    useLazyGetRandomMessagesQuery
} from "../../services/api";

export default function MessagesFetcher(props) {

    const [getFromTopOrBottom] = useLazyGetMessagesQuery()
    const [getRandom] = useLazyGetRandomMessagesQuery()
    const [getFromADate] = useLazyGetMessagesFromDateQuery()

    useEffect(() => {
        getMessages(props.type, props.date)
        props.setValid(true)
    }, [props.type, props.date, props.valid]);

    const getMessages = async (type, date) => {

        const args = {channelId: props.channelId}
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

        props.setIsFetching(true)
        let resp = null
        if (type === FROM_THE_TOP || type === FROM_THE_BOTTOM) {
            resp = await getFromTopOrBottom(args)
        } else if (type === RANDOM || type === RANDOM_HOT) {
            resp = await getRandom(args)
        } else if (type === FROM_A_DATE) {
            resp = await getFromADate(args)
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
                props.setShowMessagesBeforeButton(!data[0].end_of_the_line)
                props.setShowMessagesAfterButton(!data[data.length - 1].end_of_the_line)
            }
            props.setMainMessagesView(data)
        }
        props.setIsFetching(false)
    }

    return <div/>

}