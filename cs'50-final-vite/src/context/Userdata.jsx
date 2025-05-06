import React, { createContext, useState, useContext } from "react";
import axios from "axios";

import { useAuth } from "./AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UserdataContext = createContext(null);

export const Userdataprovider = ({ children }) => {
  const { user } = useAuth();

  const [Usermaindata, setUsermaindata] = useState({});

  const getuserdata = async () => {
    console.log(user);
    try {
      const res = await axios.post(
        `${backendUrl}/getuserdata`,
        {
          userid: user,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        console.log(res.data.data);
        setUsermaindata(res.data.data);
      }
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <UserdataContext.Provider value={{ Usermaindata, getuserdata }}>
      {children}
    </UserdataContext.Provider>
  );
};

export const useUserdata = () => useContext(UserdataContext);
