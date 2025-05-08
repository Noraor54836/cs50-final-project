import React from "react";
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
  const { Usermaindata } = useUserdata();

  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      </div>
    </div>
  );
}

export default Home;
