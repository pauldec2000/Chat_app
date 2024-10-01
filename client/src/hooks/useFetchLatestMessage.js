import { useContext,useEffect,useState } from "react";
import { ChatContext } from "../context/chatContext";
import { BASE_URL,GET_REQUEST } from "../utils/services";



export const useFetchLatestMessage=(chat)=>{
    const {newsMessage,notifications}=useContext(ChatContext);
    const [latestMessage,setLatestMessage]=useState(null);

    useEffect(()=>{
        const getMessages=async()=>{
            const response=await GET_REQUEST(`${BASE_URL}/messages/${chat?._id}`)
            if(response?.error){
                return console.log("error geting messages..",error)
            }
            const latestMessage=response[response?.length-1];
            setLatestMessage(latestMessage);
        }
        getMessages();

    },[newsMessage,notifications])
    return {latestMessage}
}