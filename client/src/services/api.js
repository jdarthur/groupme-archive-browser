import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ }),
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
            query: (args) => `/api/channels/${args.channelId}/messages/from_date/${args.date}`
        }),
        getMessagesFromMessageId: builder.query({
            query: (args) => `/api/messages/around/${args.messageId}${args.query}`
        }),
        searchMessagesForText: builder.query({
            query: (args) => ({
                url: `/api/channels/${args.channelId}/search/contains_text`,
                method: "POST",
                body: args.body
            })
        }),
        getMessagesDefault: builder.query({
            query: (args) => `/api/${args.apiBase}${args.messageId ? args.messageId : args.channelId}/${args.endSegment}${args.query}`
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
} = api