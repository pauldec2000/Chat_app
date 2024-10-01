import { createContext, useCallback, useEffect, useState } from "react";
import { BASE_URL, POST_REQUEST } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setuser] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [isregisterLoading, setIsregisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  console.log(loginInfo, "loginInfo...");
  const [loginError, setLoginError] = useState(null);
  const [isloginLoading, setIsloginLoading] = useState(false);
  useEffect(() => {
    const user = localStorage.getItem("User");
    setuser(JSON.parse(user));
  }, []);
  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo((prevInfo) => ({
      ...prevInfo,
      ...info,
    }));
  }, []);
  const updateLoginInfo = useCallback((info) => {
    setLoginInfo((prevInfo) => ({
      ...prevInfo,
      ...info,
    }));
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsregisterLoading(true);
      setRegisterError(null);
      const response = await POST_REQUEST(
        `${BASE_URL}/users/register`,
        registerInfo
      );
      setIsregisterLoading(false);
      if (response?.error) {
        return setRegisterError(response);
      }
      localStorage.setItem("User", JSON.stringify(response));
      setuser(response);
    },
    [registerInfo]
  );

  const loginUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsloginLoading(true);
      setLoginError(null);
      const response = await POST_REQUEST(`${BASE_URL}/users/login`, loginInfo);
      setIsloginLoading(false);
      if (response.error) {
        return setLoginError(response);
      }
      localStorage.setItem("User", JSON?.stringify(response));
      setuser(response);
    },
    [loginInfo]
  );

  const logoutUser = useCallback(() => {
    localStorage.removeItem("User");
    setuser(null);
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegisterInfo,
        registerUser,
        registerError,
        isregisterLoading,
        logoutUser,
        loginUser,
        loginInfo,
        loginError,
        isloginLoading,
        updateLoginInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
