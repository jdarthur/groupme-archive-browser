import React, {useState} from 'react';

export default function DateTime(props) {

    const [showFull, setShowFull] = useState(false)

    const fullDate = new Date(props.date).toLocaleString()
    const time = new Date(props.date).toLocaleTimeString()

    return <span onClick={() => setShowFull(!showFull)} style={{cursor: "pointer"}}>
            {(props.full || showFull) ? fullDate : time}
        </span>
}



