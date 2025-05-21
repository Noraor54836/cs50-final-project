import React, { createContext, useState, useContext } from "react";
import axios from "axios";

import { useAuth } from "./AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UserdataContext = createContext(null);

export const Userdataprovider = ({ children }) => {
  const { user } = useAuth();

  const [Usermaindata, setUsermaindata] = useState({});
  const [Userhistory, setUserhistory] = useState({});
  const [Usercache, setUsercache] = useState(null);

  const formatdata = (data) => {
    const datedata = data
      .map((items) => {
        if (items.checkout || items.time_spent != null) {
          const checkin_date = new Date(items.checkin);
          const checkout_date = new Date(items.checkout);
          const timespent = items.timespend;
          const hours = Math.floor(timespent / 3600);
          const minutes = Math.floor((timespent % 3600) / 60);
          const seconds = Math.floor(timespent % 60);
          const month = checkin_date.getMonth();
          const year = checkin_date.getFullYear();
          const date = checkin_date.getDate();
          const day = checkin_date.getDay();

          return {
            checkin: checkin_date,
            checkout: checkout_date,
            time_spent: timespent,
            checktime: `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
            month: month,
            year: year,
            date: date,
            day: day,
          };
        }

        return null;
      })
      .filter(Boolean);

    const sortdata = datedata.sort((a, b) => {
      b.year - a.year || a.month - b.month || a.date - b.date;
    });

    const groupedData = sortdata.reduce((acc, item) => {
      console.log(item, sortdata, "item datedata");
      if (!item) return acc;

      const { year, month } = item;

      if (!acc[year]) {
        acc[year] = {};
      }

      if (!acc[year][month]) {
        acc[year][month] = [];
      }

      acc[year][month].push(item);
      return acc;
    }, {});

    return groupedData;
  };

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
        console.log(res.data.data, "getuserdata");
        setUsermaindata(res.data.data);
      }
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const getuserhistory = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/gethistory`,
        {
          userid: user,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        console.log(res.data.data, "userhistory");
        const data = res.data.data;
        const result = formatdata(data);

        console.log(result, "result datedata history");
        setUserhistory(result);
      }
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const getusercache = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/getcache`,
        {
          userid: user,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        console.log(res.data.data, "usercache");
        setUsercache(res.data.data);
      }
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <UserdataContext.Provider
      value={{
        Usermaindata,
        getuserdata,
        setUsermaindata,
        Userhistory,
        getuserhistory,
        Usercache,
        getusercache,
      }}
    >
      {children}
    </UserdataContext.Provider>
  );
};

export const useUserdata = () => useContext(UserdataContext);
