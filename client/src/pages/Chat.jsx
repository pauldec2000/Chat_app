import React, { useContext } from "react";
import { ChatContext } from "../context/chatContext";
import { Container, Stack } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import UserChat from "../components/userChat/UserChat";
import PotentialChats from "../components/userChat/PotentialChats";
import ChatBox from "../components/userChat/ChatBox";

function Chat() {
  const { userChats, isUserChatsLoding, updateCurrentChat } =
    useContext(ChatContext);
  const { user } = useContext(AuthContext);
  return (
    <Container>
      <PotentialChats />
      {userChats?.length < 1 ? null : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0" gap={3} pe-3>
            {isUserChatsLoding && <p>Loading chats....</p>}
            {userChats?.map((chat, index) => {
              return (
                <>
                  <div key={index} onClick={() => updateCurrentChat(chat)}>
                    <UserChat chat={chat} user={user} />
                  </div>
                </>
              );
            })}
          </Stack>
          <ChatBox />
        </Stack>
      )}
    </Container>
  );
}

export default Chat;
