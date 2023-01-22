import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'


export const baseQuery = fetchBaseQuery({
    prepareHeaders: (headers, {getState}) => {
        const userToken = getState().auth.token;

        if (userToken) {
            headers.set('auth0-token', userToken);
        }

        return headers;
    },
});


export const mainApi = createApi({
    reducerPath: 'mainApi',
    baseQuery: baseQuery,
    tagTypes: [
        "channels",
        "friends",
        "friend",
        "messages",
        "random_messages",
        "messages_from_id",
        "messages_from_date"
    ],
    endpoints: (builder) => ({
        getChannels: builder.query({
            query: () => `/api/channels`,
            providesTags: ['channels']
        }),
        getMembers: builder.query({
            query: () => `/api/friends`,
            providesTags: ['friends']
        }),
        getMember: builder.query({
            query: (id) => `/api/friends/${id}`,
            providesTags: ['friend']
        }),
        getMessages: builder.query({
            query: (args) => `/api/channels/${args.channelId}/messages${args.query}`,
            providesTags: ['messages']
        }),
        getRandomMessages: builder.query({
            query: (args) => `/api/channels/${args.channelId}/messages/random${args.query}`,
            providesTags: ['random_messages']
        }),
        getMessagesFromDate: builder.query({
            query: (args) => `/api/channels/${args.channelId}/messages/from_date/${args.date}`,
            providesTags: ["messages_from_date"]
        }),
        getMessagesFromMessageId: builder.query({
            query: (args) => `/api/messages/around/${args.messageId}${args.query}`,
            providesTags: ["messages_from_id"]
        }),
        getControversialMessage: builder.query({
            query: (args) => `/api/channels/${args.channelId}/messages/controversial`,
            providesTags: ['random_messages']
        }),
        getNighttime: builder.query({
            query: (args) => `/api/channels/${args.channelId}/messages/nighttime`,
            providesTags: ["random_messages"]
        }),
        searchMessagesForText: builder.query({
            query: (args) => ({
                url: `/api/channels/${args.channelId}/search/contains_text`,
                method: "POST",
                body: args.body
            })
        }),
        getMessagesDefault: builder.query({
            query: (args) => `/api${args.apiBase}${args.messageId ? args.messageId : args.channelId}/${args.endSegment}${args.query}`,
            providesTags: ["messages", "messages_from_id"]
        }),
        disavowMessage: builder.mutation({
            query: (args) => ({
                url: `/api/messages/disavow/${args.message_id}`,
                method: "POST",
                body: args.body,
            }),
            invalidatesTags: ["messages", "random_messages", "messages_from_id", "messages_from_date"]
        }),
        undisavowMessage: builder.mutation({
            query: (message_id) => ({
                url: `/api/messages/undisavow/${message_id}`,
                method: "POST",
            }),
            invalidatesTags: ["messages", "random_messages", "messages_from_id", "messages_from_date"]
        }),
        getMemberByAuth0Sub: builder.query({
            query: (auth0_sub) => `/api/friends/by_sub/${auth0_sub}`,
            providesTags: ['this_friend']
        }),
        getHighlights: builder.query({
            query: () => `/api/highlights`,
            providesTags: ['highlights']
        }),
        getHighlightComponent: builder.query({
            query: (args) => `/api/highlight_component/type/${args.type}/from/${args.first_message_id}/through/${args.last_message_id}`,
        }),
        getMessageById: builder.query({
            query: (messageId) => `/api/messages/${messageId}`
        }),
        createHighlight: builder.mutation({
            query: (body) => ({
                url: `/api/highlights`,
                method: "POST",
                body: body
            }),
            invalidatesTags: ["highlights"]
        }),
        getHighlightById: builder.query({
            query: (id) => `/api/highlights/${id}`
        }),
        deleteHighlight: builder.mutation({
            query: (id) => ({
                url: `/api/highlights/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["highlights"]
        }),
    }),
})

export const {
    useGetChannelsQuery,
    useGetMembersQuery,
    useGetMemberQuery,
    useGetMessagesQuery,
    useLazyGetMessagesQuery,
    useGetRandomMessagesQuery,
    useLazyGetRandomMessagesQuery,
    useGetMessagesFromDateQuery,
    useLazyGetMessagesFromDateQuery,
    useGetMessagesFromMessageIdQuery,
    useLazyGetMessagesFromMessageIdQuery,
    useLazySearchMessagesForTextQuery,
    useGetMessagesDefaultQuery,
    useDisavowMessageMutation,
    useUndisavowMessageMutation,
    useLazyGetControversialMessageQuery,
    useLazyGetNighttimeQuery,
    useGetMemberByAuth0SubQuery,
    useGetHighlightsQuery,
    useGetHighlightComponentQuery,
    useGetMessageByIdQuery,
    useCreateHighlightMutation,
    useGetHighlightByIdQuery,
    useDeleteHighlightMutation,
} = mainApi