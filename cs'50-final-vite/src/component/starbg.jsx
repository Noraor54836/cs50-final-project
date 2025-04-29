import React, { useEffect, useState, useRef } from "react";

function StarBackground(props) {
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  const starRef = useRef(null);
  const textRef = useRef(null);

  const [starScale, setStarScale] = useState(1.4);
  const [textSize, setTextSize] = useState(100);

  const starAnimRef = useRef(null);
  const textAnimRef = useRef(null);

  // Wait for 3 seconds before enabling hover animations
  useEffect(() => {
    const timer = setTimeout(() => setInitialAnimationDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Animation helpers
  const animate = (ref, updater, duration, keyframeFn, animRef, time = 0) => {
    const progress = (time % duration) / duration;
    const value = keyframeFn(progress);
    if (ref.current) {
      updater(ref.current, value);
    }
    animRef.current = requestAnimationFrame(() =>
      animate(ref, updater, duration, keyframeFn, animRef, time + 16.67)
    );
  };

  const handleMouseEnter = () => {
    if (!initialAnimationDone) return;

    animate(
      starRef,
      (el, scale) => {
        el.style.transform = `scale(${scale})`;
        setStarScale(scale);
      },
      8000,
      (p) =>
        p < 0.33
          ? 1.4 + 0.5 * (p / 0.33)
          : p < 0.66
          ? 1.9 - 0.5 * ((p - 0.33) / 0.33)
          : 1.4,
      starAnimRef
    );

    animate(
      textRef,
      (el, size) => {
        el.style.backgroundSize = `${size}%`;
        setTextSize(size);
      },
      4000,
      (p) => (p < 0.5 ? 100 + 550 * (p / 0.5) : 650 - 550 * ((p - 0.5) / 0.5)),
      textAnimRef
    );
  };

  const handleMouseLeave = () => {
    cancelAnimationFrame(starAnimRef.current);
    cancelAnimationFrame(textAnimRef.current);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(starAnimRef.current);
      cancelAnimationFrame(textAnimRef.current);
    };
  }, []);

  return (
    <div
      className="star-background"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={starRef}
        className={`star ${initialAnimationDone ? "animation-complete" : ""}`}
      ></div>
      {props.content === "login" && (
        <h3
          ref={textRef}
          className={`gradient-text ${
            initialAnimationDone ? "animation-complete" : ""
          }`}
        >
          Welcome if you want to Develop yourself,
          <br /> you come to right website, Let's be new together.
        </h3>
      )}
    </div>
  );
}

export default StarBackground;
