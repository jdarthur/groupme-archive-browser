import React, {useEffect} from 'react';
import 'antd/dist/reset.css';
import './App.css';
import AllChannels from "./features/channels/AllChannels";
import {Link, Outlet, Route, Routes, useLocation} from "react-router-dom";

import {Layout, Menu} from 'antd';
import AllMembers from "./features/members/AllMembers";
import OneMember from "./features/members/OneMember";
import Messages from "./features/messages/Messages";
import ListOfChannelsLandingPage from "./features/channels/ListOfChannelsLandingPage";
import ChannelSearch from "./features/search/ChannelSearch";
import {useDispatch} from "react-redux";
import {useAuth0} from "@auth0/auth0-react";
import {setToken} from "./app/store";
import AuthButton from "./features/auth/AuthButton";
import {FolderOutlined, HighlightOutlined, MessageOutlined, SearchOutlined, TeamOutlined} from "@ant-design/icons";
import Highlights from "./features/highlights/Highlights";
import SingleHighlightPage from "./features/highlights/SingleHighlightPage";
import SubAssignment from "./features/members/SubAssignment";

const {Content, Header} = Layout;

const CHANNELS = "channels"
const FRIENDS = "friends"
const MESSAGES = "messages"
const SEARCH = "search"
const HIGHLIGHTS = "highlights"

export default function App() {

    const {getAccessTokenSilently, isLoading: authIsLoading} = useAuth0();
    const dispatch = useDispatch();

    const {pathname} = useLocation()
    const selectedKeys = [getSelectedMenuItem(pathname)]

    useEffect(() => {
        const getEditorJwt = async () => {
            try {
                const authToken = await getAccessTokenSilently({
                    audience: "https://borttrivia.com/editor",
                    scope: "openid profile email offline_access read:current_user",
                });
                dispatch(setToken({authToken}));
            } catch (e) {
                console.log(e.message);
            }
        };

        getEditorJwt();
    }, [getAccessTokenSilently]); // eslint-disable-line react-hooks/exhaustive-deps


    const nothingView = <main style={{padding: "1rem"}}>
        <p>There's nothing here!</p>
    </main>


    const defaultView = <AllChannels/>
    return (
        <div style={{height: '100vh', display: "flex", flexDirection: "column", position: "absolute", top: 0, bottom: 0, left: 0}}>
            <Header>
                <Menu mode="horizontal"
                      defaultSelectedKeys={["channels"]}
                      theme={"dark"}
                      style={{minWidth: 0, flex: "auto"}}
                      selectedKeys={selectedKeys}
                >

                    <Menu.Item key={"channels"} icon={<FolderOutlined/>}>
                        <Link to={"channels"}>Channels</Link>
                    </Menu.Item>
                    <Menu.Item key={"friends"} icon={<TeamOutlined/>}>
                        <Link to={"friends"}>Friends</Link>
                    </Menu.Item>
                    <Menu.Item key={"messages"} icon={<MessageOutlined/>}>
                        <Link to={"messages"}>Messages</Link>
                    </Menu.Item>
                    <Menu.Item key={"search"} icon={<SearchOutlined/>}>
                        <Link to={"search"}>Search</Link>
                    </Menu.Item>
                    <Menu.Item key={"highlights"} icon={<HighlightOutlined/>}>
                        <Link to={"highlights"}>Highlights</Link>
                    </Menu.Item>
                    <Menu.Item key={"auth"}>
                        <AuthButton loading={authIsLoading}/>
                    </Menu.Item>
                </Menu>

            </Header>
            <Routes>
                <Route path="/" element={<Content style={{minHeight: 500, flexGrow: 1}}> <Outlet/> </Content>}>
                    <Route path="channels" element={<Outlet/>}>
                        <Route index element={defaultView}/>
                    </Route>
                    <Route path="friends" element={<Outlet/>}>
                        <Route index element={<AllMembers/>}/>
                        <Route path=":friendId"
                               element={<OneMember/>}/>
                    </Route>
                    <Route path="messages" element={<ListOfChannelsLandingPage destination={"messages"}/>}/>
                    <Route path="search" element={<ListOfChannelsLandingPage destination={"search"}/>}/>
                    <Route path="messages/:channelId" element={<Messages/>}/>
                    <Route path="search/:channelId" element={<ChannelSearch/>}/>
                    <Route path="highlights" element={<Outlet/>}>
                        <Route index element={<Highlights/>}/>
                        <Route path=":highlightId"
                               element={<SingleHighlightPage/>}/>
                    </Route>
                    <Route index element={defaultView}/>
                    <Route path="*" element={nothingView}/>
                    <Route path="admin/sub_assignment" element={<SubAssignment/>}/>
                </Route>
            </Routes>
        </div>
    );
}

function getSelectedMenuItem(path) {
    if (path.includes(CHANNELS)) {
        return CHANNELS
    }
    if (path.includes(FRIENDS)) {
        return FRIENDS
    }
    if (path.includes(MESSAGES)) {
        return MESSAGES
    }
    if (path.includes(SEARCH)) {
        return SEARCH
    }
    if (path.includes(HIGHLIGHTS)) {
        return HIGHLIGHTS
    }
}

