import React from "react";
import { useState, useEffect, useRef } from "react";

function Clock() {
  const [time, updateTime] = useState(new Date());
  const secondsRef = useRef(null);
  const minutesRef = useRef(null);
  const hoursRef = useRef(null);
  const setTime = () => {
    const time = new Date();

    const seconds = time.getSeconds();
    const secondsDegrees = (seconds / 60) * 360 + 270;
    secondsRef.current.style.transform = `rotate(${secondsDegrees}deg)`;

    const minutes = time.getMinutes();
    const minutesDegrees = (minutes / 60) * 360 + (seconds / 60) * 6 + 270;
    minutesRef.current.style.transform = `rotate(${minutesDegrees}deg)`;

    const hours = time.getHours();
    const hoursDegrees = (hours / 12) * 360 + (minutes / 60) * 30 + 270;
    hoursRef.current.style.transform = `rotate(${hoursDegrees}deg)`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime();
      updateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clock">
      <div className="clock-layout">
        <span className="pointer" ref={secondsRef}></span>
        <span className="pointer" ref={minutesRef}></span>
        <span className="pointer" ref={hoursRef}></span>

        <span className="twelve line long"></span>
        <span className="one line short"></span>
        <span className="two line short"></span>
        <span className="three line long"></span>
        <span className="four line short"></span>
        <span className="five line short"></span>
        <span className="six line long"></span>
        <span className="seven line short"></span>
        <span className="eight line short"></span>
        <span className="nine line long"></span>
        <span className="ten line short"></span>
        <span className="eleven line short"></span>

        <div className="time-text">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export default Clock;
