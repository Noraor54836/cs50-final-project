import React, { use } from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useUserdata } from "../context/Userdata";

import StarBackground from "./starbg";
import Clock from "./clock";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Home() {
  const { user, isLoggedIn } = useAuth();
  const { Usermaindata, Usercache } = useUserdata();

  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const [checkin, setCheckin] = useState({ date: "", time: "" });
  const [checkout, setCheckout] = useState({ date: "", time: "" });

  const timeSpentRef = useRef(0);

  const checkinRef = useRef(null);
  const quoteRef = useRef(null);
  const isCalled = useRef(false);
  const layerRef = useRef(null);

  const date = new Date();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const { goal, start_date, end_date } = Usermaindata;

  const Random_quote = async () => {
    try {
      setIsLoading(true);
      isCalled.current = true;
      const res = await axios.get(`${backendUrl}/randomquote`);

      if (res.status === 200) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(res.data[0].h, "text/html");
        const quoteText =
          doc.querySelector("blockquote").firstChild.textContent;
        const author = doc.querySelector("footer").textContent;

        console.log(quoteText, author);
        return { text: quoteText, author: author };
      }
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      isCalled.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("check cache", Usercache);
    const checkCache = async () => {
      if (Usercache) {
        console.log("Checking Usercache", Usercache);
        const { checkin, checkout } = Usercache;

        if (checkout === null) {
          const checkinDate = new Date(checkin);
          checkinRef.current = checkinDate.toISOString();
          const now = new Date();
          const spentTime = Math.floor((now - checkinDate) / 1000);

          setCheckin({
            date: checkinDate.toLocaleDateString("en-GB"),
            time: checkinDate.toLocaleTimeString("en-GB"),
          });

          setTimeSpent(spentTime);
          timeSpentRef.current = spentTime;
          setIsChecked(true);
        }
      }
    };

    checkCache();
  }, [Usercache]);

  useEffect(() => {
    const loadInitialQuote = async () => {
      const newQuote = await Random_quote();
      if (newQuote) {
        setQuote(newQuote);
        console.log(newQuote);
      }
    };
    loadInitialQuote();
  }, []);

  const handleMouseOver = () => {
    if (!isLoading) {
      setIsHovered(true);
    }
  };

  const handleMouseOut = async () => {
    if (!isCalled.current && isHovered && !isLoading) {
      const newQuote = await Random_quote();
      if (newQuote) {
        quoteRef.current = newQuote;
      }
      setIsHovered(false);
    }
  };

  const handleToggle = (status) => {
    if (status === true && timeSpent === 0) {
      setIsChecked(true);
    } else if (status === false && timeSpent > 10) {
      setIsChecked(false);
    }
  };

  // useEffect(() => {
  //   console.log("isChecked test", isChecked, timeSpent);
  // }, [isChecked, timeSpent]);

  useEffect(() => {
    if (isChecked) {
      if (timeSpent === 0) {
        handleCheckin_out(true);
      }
      let interval;

      interval = setInterval(() => {
        timeSpentRef.current += 1;
        setTimeSpent(timeSpentRef.current);
      }, 1000);

      return () => clearInterval(interval);
    } else if (!isChecked) {
      if (timeSpent > 0) {
        handleCheckin_out(false);
      }
    }
  }, [isChecked]);

  const formattime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCheckin_out = async (checkstatus) => {
    const date = new Date();
    const isodate = date.toISOString();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const dateshown = `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}
    `;

    const timeshown = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:${second.toString().padStart(2, "0")}`;

    if (checkstatus === true) {
      setCheckin({
        date: dateshown,
        time: timeshown,
      });

      checkinRef.current = isodate;

      try {
        const res = await axios.post(
          `${backendUrl}/recordtime`,
          {
            userid: user,
            checkin: isodate,
            checkout: null,
            status: true,
          },
          {
            withCredentials: true,
          }
        );
      } catch (err) {
        console.log(err);
      }
    } else {
      setCheckout({
        date: dateshown,
        time: timeshown,
      });

      try {
        const res = await axios.post(
          `${backendUrl}/recordtime`,
          {
            userid: user,
            checkin: checkinRef.current,
            checkout: isodate,
            status: false,
          },
          {
            withCredentials: true,
          }
        );

        if (res.status === 201) {
          setTimeout(() => {
            setTimeSpent(0), (timeSpentRef.current = 0);
            setCheckin({ date: "", time: "" });
            setCheckout({ date: "", time: "" });
          }, 3000);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    const layer = layerRef.current;
    const handleTransitionEnd = (event) => {
      console.log("transition end", event);

      if (event.propertyName === "height") {
        console.log("transition end (height)");
        if (!isHovered && !isCalled.current && !isLoading) {
          console.log("set quote");
          setQuote({
            text: quoteRef.current.text,
            author: quoteRef.current.author,
          });
        }
      }
    };

    if (layer) {
      layer.addEventListener("transitionend", handleTransitionEnd);
    }

    return () => {
      if (layer) {
        layer.removeEventListener("transitionend", handleTransitionEnd);
      }
    };
  }, [isHovered]);

  return (
    <div className="container home">
      <div className="main_goal">
        <StarBackground content="home" user={goal} />
      </div>

      <div className="improve-row-layout">
        <h1> Improve yourself </h1>
      </div>

      <div className="row-1-layout">
        <div className="clock_border">
          <Clock />
        </div>

        <div className="quote_card">
          <div className="quote">
            <div className="gradient_circle"></div>
            <h1>
              <span className="quote-text">
                {quote.text}
                {quote.author}
              </span>
            </h1>
          </div>

          <div
            className="layer"
            ref={layerRef}
            onMouseOut={handleMouseOut}
            onMouseOver={handleMouseOver}
          >
            <h1> Get random quote </h1>
          </div>
        </div>
      </div>

      <div className="row-2-layout">
        <div className="date-now">
          <h1>
            {date.getDate()} {months[date.getMonth()]} {date.getFullYear()}
          </h1>
        </div>

        <div className="check-in-layout">
          <div className={`check-in ${isChecked ? "active" : ""}`}>
            <div className="switch">
              <label htmlFor="toggle" className="toggle-label">
                <input
                  className="circle"
                  id="toggle"
                  name="toggle"
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(!isChecked)}
                />

                <span className="slider">
                  <div className="star_button star_1"></div>
                  <div className="star_button star_2"></div>
                  <div className="star_button star_3"></div>
                  <svg viewBox="0 0 16 16" className="cloud_1 cloud">
                    <path
                      transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                      fill="#fff"
                      d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                    ></path>
                  </svg>
                </span>
              </label>
            </div>
          </div>

          <div className="time-spent">
            <div className={`time-spent-title ${isChecked ? "active" : ""}`}>
              <h1>
                {" "}
                Time{" "}
                <span
                  className={`time-slide spend ${isChecked ? "active" : ""}`}
                >
                  spend
                </span>{" "}
                <span
                  className={`time-slide stop ${!isChecked ? "active" : ""}`}
                >
                  stop
                </span>
              </h1>
            </div>
            <div className="time-spent-number">
              <span className={isChecked ? "active" : ""}>
                {formattime(timeSpent)}
              </span>
            </div>
          </div>
        </div>

        <div className="check-time-mark">
          <table>
            <thead>
              <tr>
                <th>Time Start</th>
                <th>Time Stop</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  {checkin.date === "" || checkin.time === "" ? (
                    <p>Check-in for start</p>
                  ) : (
                    <>
                      <p>Check-in Date: {checkin.date}</p>
                      <p>Check-in Time: {checkin.time}</p>
                    </>
                  )}
                </td>
                <td>
                  {checkout.date === "" || checkout.time === "" ? (
                    <p>Check-out for stop</p>
                  ) : (
                    <>
                      <p>Check-out Date: {checkout.date}</p>
                      <p>Check-out Time: {checkout.time}</p>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Home;
