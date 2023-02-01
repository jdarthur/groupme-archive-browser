
import React from 'react';
import {useGetTopPostsQuery} from "../../services/api";
import PagedListOfMessagesWithContextLink from "../search/PagedListOfMessagesWithContextLink";

export default function TopPosts({friendId}) {
    const {data, isFetching} = useGetTopPostsQuery(friendId)
    const messages = data?.resource || []

    return <div style={{padding: 25, width: 700, maxHeight: "80vh", display: "flex"}}>
        {<PagedListOfMessagesWithContextLink messages={messages} loading={isFetching} doNotHighlight />}
    </div>
}


