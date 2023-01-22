import React from 'react';
import DateTime from "../common/DateTime";

function topStyle(showLine, previous_message_id) {
    return {
        color: "#8c8c8c",
        fontSize: "0.8em",
        textAlign: "center",
        padding: showLine ? 20 : 0,
        borderTop: (showLine && previous_message_id) ? "1px solid #f0f0f0" : "",
        paddingTop: showLine ? 10 : 0,
        marginTop: showLine ? 10 : 0
    }
}

const MILLISECONDS_BETWEEN_MESSAGES_TO_SHOW_DATE_AGAIN = 1800000

export default function PreMessageTimestamp({previous_date, previous_message_id,
                                             previous_user_id, user_id,
                                             date, end_of_the_line, hideTopDate}) {
    const fullDate = <DateTime date={date} full />

    const dateBefore = Date.parse(previous_date || 0)
    const timeSincePreviousPost = Date.parse(date) - dateBefore
    const hideDate = ((timeSincePreviousPost < MILLISECONDS_BETWEEN_MESSAGES_TO_SHOW_DATE_AGAIN) ||
        (user_id === "system" && !end_of_the_line) || hideTopDate)
    const showLine = (!hideDate && (previous_user_id !== "system"))

    return <div style={topStyle(showLine, previous_message_id)}>
        {!hideDate ? fullDate : null}
    </div>
}