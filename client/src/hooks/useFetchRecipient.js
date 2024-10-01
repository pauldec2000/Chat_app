import { useEffect, useState } from "react";
import { BASE_URL, GET_REQUEST } from "../utils/services"; // Assuming GET_REQUEST is imported

export const useFetchRecipientUser = (chat, user) => {
  const [recipientUser, setRecipientUser] = useState(null);
  const [error, setError] = useState(null);

  const recipientId = chat?.members.find((id) => id !== user?._id);

  useEffect(() => {
    const getUser = async () => {
      if (!recipientId) return; // Proceed only if recipientId exists

      try {
        const response = await GET_REQUEST(`${BASE_URL}/users/find/${recipientId}`);
        
        if (response.error) {
          setError(response.error); // Set the correct error here
        } else {
          setRecipientUser(response);
        }
      } catch (err) {
        setError(err.message); // Handle any errors from the request
      }
    };

    getUser();
  }, [recipientId]); // Add recipientId as a dependency

  return { recipientUser, error };
};
