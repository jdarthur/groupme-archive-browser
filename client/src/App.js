import React from 'react';
import 'antd/dist/reset.css';
import './App.css';
import AllChannels from "./features/channels/AllChannels";
import {Link, Outlet, Route, Routes} from "react-router-dom";

import {Layout, Menu} from 'antd';
import AllMembers from "./features/members/AllMembers";
import OneMember from "./features/members/OneMember";
import Messages from "./features/messages/Messages";
import ListOfChannelsLandingPage from "./features/channels/ListOfChannelsLandingPage";
import ChannelSearch from "./features/search/ChannelSearch";

const {Content, Header, Footer} = Layout;

export default function App() {
    const nothingView = <main style={{padding: "1rem"}}>
        <p>There's nothing here!</p>
    </main>

    const defaultView = <AllChannels/>

    return (
        <div style={{height: '100vh', display: "flex", flexDirection: "column"}}>
            <Header>
                <Menu theme="dark" mode="horizontal">
                    <Menu.Item key={"Channels"}>
                        <Link to={"channels"}>Channels</Link>
                    </Menu.Item>
                    <Menu.Item key={"Friends"}>
                        <Link to={"friends"}>Friends</Link>
                    </Menu.Item>
                    <Menu.Item key={"messages"}>
                        <Link to={"messages"}>Messages</Link>
                    </Menu.Item>
                    <Menu.Item key={"search"}>
                        <Link to={"search"}>Search</Link>
                    </Menu.Item>
                </Menu>
            </Header>
            <Routes>
                <Route path="/" element={<Content style={{minHeight: 500, flex: 1}}> <Outlet/> </Content>}>
                    <Route path="channels" element={<Outlet/>}>
                        <Route index element={defaultView}/>
                    </Route>
                    <Route path="friends" element={<Outlet/>}>
                        <Route index element={<AllMembers />}/>
                        <Route path=":friendId"
                               element={<OneMember />}/>
                    </Route>
                    <Route path="messages" element={<ListOfChannelsLandingPage destination={"messages"}/>} />
                    <Route path="Search" element={<ListOfChannelsLandingPage destination={"search"}/>} />
                    <Route path="channels/:channelId/messages" element={<Messages />} />
                    <Route path="channels/:channelId/search" element={<ChannelSearch />} />
                    <Route index element={defaultView}/>
                    <Route path="*" element={nothingView}/>
                </Route>
            </Routes>
            <Footer style={{textAlign: 'center'}}>

            </Footer>

        </div>
    );
}

