import React, {useState} from 'react';
import {Pagination} from "antd";

export default function PagedList({items}) {
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    const onPageChange = (value) => {
        setPage(value - 1)
    }

    const onPageSizeChange = (value, value2) => {
        setPageSize(value2)
    }

    const list = items || []

    const firstIndex = page * pageSize
    const lastIndex = firstIndex + pageSize
    const subset = list.slice(firstIndex, lastIndex)

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <div style={{display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", maxWidth: "min(700px, 100vw)", paddingRight: '5.5rem'}}>
                {subset}
            </div>
            <div style={{padding: 10, borderTop: "1px solid #d9d9d9"}}>
                {list.length > 0 ? <Pagination total={items?.length}
                                               onChange={onPageChange}
                                               onShowSizeChange={onPageSizeChange}
                                               showQuickJumper
                                               showLessItems

                /> : null}
            </div>

        </div>
    );
}
