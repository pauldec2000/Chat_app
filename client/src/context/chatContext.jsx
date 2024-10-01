import { createContext, useCallback, useEffect, useState } from "react";
import { BASE_URL, GET_REQUEST, POST_REQUEST } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatError, setUserChatError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [isMessagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMeaasge] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  console.log(notifications, "notifications..");
  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user]);
  // add onlie users
  useEffect(() => {
    if (socket === null) return;
    socket.emit("add new user", user?._id);
    socket.on("getOnlieUsers", (res) => {
      setOnlineUsers(res);
    });
    return () => {
      socket.off("getOnlieUsers");
    };
  }, [socket]);
  // send message

  useEffect(() => {
    if (socket === null || !newMessage || !currentChat) return;
    const recipientId = currentChat.members.find((id) => id !== user?._id);
    if (recipientId) {
      socket.emit("sendMessage", { ...newMessage, recipientId });
    }
  }, [newMessage, currentChat]);

  // recive message and notifications
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res?.chatId) return;
      setMessages((prev) => [...prev, res]);
    });

    socket.on("getNotification", (res) => {
      const isChatOpen = currentChat?.members?.some(
        (id) => id === res?.senderId
      );
      if (isChatOpen) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await GET_REQUEST(`${BASE_URL}/users`);
      if (response.error) {
        return console.log("erroe featching user", response);
      }
      const pChats = response.filter((u) => {
        let isChatCreated = false;
        if (user?._id === u?._id) return false;

        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat.members[0] === u._id || chat.members[1] === u._id;
          });
        }
        return !isChatCreated;
      });
      setPotentialChats(pChats);
      setAllUsers(response);
    };
    getUsers();
  }, [userChats]);
  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setIsUserChatsLoading(true);
        setUserChatError(null);
        const response = await GET_REQUEST(`${BASE_URL}/chats/${user?._id}`);
        setIsUserChatsLoading(false);
        if (response?.error) {
          return setUserChatError(response);
        }
        setUserChats(response);
      }
    };

    getUserChats();
  }, [user, notifications]);

  useEffect(() => {
    const getMessages = async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      const response = await GET_REQUEST(
        `${BASE_URL}/messages/${currentChat?._id}`
      );
      setMessagesLoading(false);
      if (response?.error) {
        return setMessagesError(response);
      }
      setMessages(response);
    };

    getMessages();
  }, [currentChat]);

  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      if (!textMessage) return console.log("you must type something...");
      const response = await POST_REQUEST(`${BASE_URL}/messages`, {
        chatId: currentChatId,
        senderId: sender?._id,
        text: textMessage,
      });
      if (response.error) {
        return setSendTextMessageError(response);
      }

      setNewMeaasge(response); // Set new message here
      setMessages((prev) => [...prev, response]);
      setTextMessage(""); // Clear the text input after message is sent
    },
    []
  );

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(async (firstId, secondId) => {
    try {
      const response = await POST_REQUEST(`${BASE_URL}/chats`, {
        firstId,
        secondId,
      });

      if (response?.error) {
        console.error("Error creating chat:", response.error);
        return;
      }

      setUserChats((prev) => [...prev, response]);
    } catch (error) {
      console.error("Network or server error:", error);
    }
  }, []);

  const markAllNotifications = useCallback(() => {
    const mNotifications = notifications.map((n) => {
      return { ...n, isRead: true };
    });
    setNotifications(mNotifications);
  }, []);

  const markNotificationsRead = useCallback(
    (n, userChats, user, notifications) => {
      // find chat to open
      const desiredChat = userChats?.find((chat) => {
        const chatMembers = [user?._id, n?.senderId];
        const isDesiredChat = chat?.members.every((member) => {
          return chatMembers.includes(member);
        });
        return isDesiredChat;
      });

      const mNotifications = notifications?.map((el) => {
        if (n?.senderId === el?.senderId) {
          return { ...n, isRead: true };
        } else {
          return el;
        }
      });
      updateCurrentChat(desiredChat);
      setNotifications(mNotifications);
    },
    []
  );

  const markThisUserNotificationsAsRead = useCallback(
    (thisUserNotifications, notifications) => {
      const mNotifications = notifications.map((el) => {
        let notification;

        thisUserNotifications.forEach((n) => {
          if (n.senderId === el.senderId) {
            notification = { ...n, isRead: true };
          } else {
            notification = el;
          }
        });
        return notification;
      });
      setNotifications(mNotifications);
    },
    []
  );
  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        currentChat,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotifications,
        markNotificationsRead,
        markThisUserNotificationsAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
