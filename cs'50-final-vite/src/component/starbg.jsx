import React, { useEffect, useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

function StarBackground(props) {
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  const starRef = useRef(null);
  const textRef = useRef(null);

  const [starScale, setStarScale] = useState(1.4);
  const [textSize, setTextSize] = useState(100);

  const starAnimationRef = useRef(null);
  const textAnimationRef = useRef(null);

  const starAnimationtime = useRef(0);
  const textAnimationtime = useRef(0);

  // Wait for 3 seconds before enabling hover animations
  useEffect(() => {
    const timer = setTimeout(() => setInitialAnimationDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Animation helpers
  const animateStar = (timeElapsed = 0) => {
    if (!starRef.current) return;

    const animationDuration = 8000; // 8 seconds
    const progress = (timeElapsed % animationDuration) / animationDuration;

    let scale;
    if (progress < 0.33) {
      scale = 1.4 + 0.5 * (progress / 0.33); // zoom in
    } else if (progress < 0.66) {
      scale = 1.9 - 0.5 * ((progress - 0.33) / 0.33); // zoom out
    } else {
      scale = 1.4; // hold
    }

    starRef.current.style.transform = `scale(${scale})`;
    setStarScale(scale); // save current scale

    const nextTime = timeElapsed + 16.67; // ~60fps
    starAnimationtime.current = nextTime;

    starAnimationRef.current = requestAnimationFrame(() =>
      animateStar(nextTime)
    );
  };

  const animateText = (timeElapsed = 0) => {
    const animationDuration = 7000;
    const progress = (timeElapsed % animationDuration) / animationDuration;

    let size;
    if (progress < 0.5) {
      size = 100 + 300 * (progress / 0.5); // Zoom in
    } else {
      size = 400 - 300 * ((progress - 0.5) / 0.5); // Zoom out
    }

    textRef.current.style.backgroundSize = `${size}%`;
    setTextSize(size);

    const nextTime = timeElapsed + 16.67; // ~60fps
    textAnimationtime.current = nextTime;

    textAnimationRef.current = requestAnimationFrame(() =>
      animateText(nextTime)
    );
  };

  const handleMouseEnter = () => {
    if (!initialAnimationDone) return;
    if (props.content === "home") return;

    starRef.current.style.transform = `scale(${starScale})`;
    starAnimationRef.current = requestAnimationFrame(() =>
      animateStar(starAnimationtime.current)
    );

    textRef.current.style.backgroundSize = `${textSize}%`;
    textAnimationRef.current = requestAnimationFrame(() =>
      animateText(textAnimationtime.current)
    );
  };

  const handleMouseLeave = () => {
    cancelAnimationFrame(starAnimationRef.current);
    cancelAnimationFrame(textAnimationRef.current);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(starAnimationRef.current);
      cancelAnimationFrame(textAnimationRef.current);
    };
  }, []);

  return (
    <div
      className={`star-background ${props.content + "-bg"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={starRef}
        className={`star ${
          initialAnimationDone && props.content != "home"
            ? "animation-complete"
            : ""
        } 
        ${props.content}`}
      ></div>

      {(() => {
        if (props.content === "login") {
          return (
            <h3
              ref={textRef}
              className={`gradient-text ${
                initialAnimationDone ? "animation-complete" : ""
              } ${props.content}`}
            >
              Welcome if you want to Develop yourself,
              <br /> you come to right website, Let's be new together.
            </h3>
          );
        } else if (props.content === "home") {
          if (props.user) {
            return (
              <div className="main_goal_text">
                <h1 className={`gradient-text ${props.content + "-text"}`}>
                  {" "}
                  Road to <br /> {props.user}
                </h1>
              </div>
            );
          } else {
            return (
              <div className="main_goal_text">
                <h1 className={`gradient-text ${props.content + "-text"}`}>
                  Set your main goal <br />{" "}
                  <Link to="/account" className="account-link gradient-text">
                    your account
                  </Link>
                </h1>
              </div>
            );
          }
        }
        return null;
      })()}
    </div>
  );
}

export default StarBackground;
