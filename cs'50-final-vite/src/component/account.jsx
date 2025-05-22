import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import PieAnimation from "./chart";
import LineChart from "./line";

import { useAuth } from "../context/AuthContext";
import { useUserdata } from "../context/Userdata";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Account() {
  const { user, isLoggedIn } = useAuth();
  const { Usermaindata, getuserdata } = useUserdata();

  const { goal, start_date, end_date, name, skill } = Usermaindata;

  const localStart = useMemo(
    () =>
      start_date
        ? new Date(start_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "",
    [start_date]
  );

  const localEnd = useMemo(
    () =>
      end_date
        ? new Date(end_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "",
    [end_date]
  );

  const [setgoal, setSetgoal] = useState(false);
  const [goalinput, setGoalinput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formerror, setFormerror] = useState("");
  const [formsuccess, setFormsuccess] = useState("");

  const [nameform, setNameform] = useState(false);
  const [nameinput, setNameinput] = useState("");
  const [skillinput, setSkillinput] = useState("");
  const [nameerror, setNameerror] = useState("");
  const [namesuccess, setNamesuccess] = useState("");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const sendgoal = async (e) => {
    e.preventDefault();

    if (!goalinput || !startDate || !endDate) {
      setFormerror("Please fill in all fields");
      return;
    }

    const startUTC = new Date(startDate).toISOString();
    const endUTC = new Date(endDate).toISOString();

    const data = {
      goal: goalinput,
      start_date: startUTC,
      end_date: endUTC,
    };

    try {
      const res = await axios.post(
        `${backendUrl}/setgoal`,
        {
          userid: user,
          data,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        await getuserdata();
        setFormerror("");
        setFormsuccess("Add goal successfully");

        setTimeout(() => {
          setSetgoal(false);
          setFormsuccess("");
        }, 1500);
      }
      console.log(res);
    } catch (err) {
      console.error(err, user, data);
    } finally {
      setGoalinput("");
      setStartDate("");
      setEndDate("");
      setFormerror("");
    }
  };

  const sendname = async (e) => {
    e.preventDefault();

    if (!nameinput || !skillinput) {
      setNameerror("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/setname`,
        {
          userid: user,
          name: nameinput,
          skill: skillinput,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        console.log(res);
        await getuserdata();
        setNameerror("");
        setNamesuccess("Add name successfully");

        setTimeout(() => {
          setNameform(false);
          setNamesuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error(err, user, nameinput, skillinput);
    } finally {
      setNameinput("");
      setSkillinput("");
      setNameerror("");
    }
  };

  const setmaingoal_form = () => {
    return (
      <div className="container set-goal">
        <div
          className="set-goal-bg"
          onClick={(e) => {
            e.stopPropagation();
            setSetgoal(false);
            setGoalinput("");
            setStartDate("");
            setEndDate("");
            setFormerror("");
          }}
        ></div>

        <div className="set-goal-form">
          <h1>Your main goal</h1>

          <div className="goal-input-layout">
            <input
              type="text"
              value={goalinput}
              onChange={(e) => setGoalinput(e.target.value)}
              placeholder="Enter your goal"
              required
            />

            <div className="date-input-layout">
              <label>Start date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{ order: "2" }}
              />

              <label>End date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{ order: "4" }}
              />
            </div>

            <div className="account-button-layout">
              <button className="btn submit" onClick={sendgoal}>
                Submit
              </button>
              <button
                className="btn cancel"
                onClick={() => {
                  setSetgoal(false);
                  setGoalinput("");
                  setStartDate("");
                  setEndDate("");
                  setFormerror("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {formsuccess && <p style={{ color: "#75a4f0" }}>{formsuccess}</p>}
          {formerror && <p style={{ color: "#d55145" }}>{formerror}</p>}
        </div>
      </div>
    );
  };

  const setname_form = () => {
    return (
      <div className="container set-goal">
        <div
          className="set-goal-bg"
          onClick={(e) => {
            e.stopPropagation();
            setNameform(false);
            setNameinput("");
            setSkillinput("");
            setNameerror("");
            setNamesuccess("");
          }}
        ></div>

        <div className="set-goal-form name">
          <h1>Set your name</h1>

          <div className="goal-input-layout">
            <input
              type="text"
              value={nameinput}
              onChange={(e) => setNameinput(e.target.value)}
              placeholder="Enter your name"
              required
            />

            <h2>Set your goal skill</h2>
            <input
              type="text"
              value={skillinput}
              onChange={(e) => setSkillinput(e.target.value)}
              placeholder="Enter your goal skill"
              required
            />

            <div className="account-button-layout">
              <button className="btn submit" onClick={sendname}>
                Submit
              </button>
              <button
                className="btn cancel"
                onClick={() => {
                  setNameform(false);
                  setNameinput("");
                  setSkillinput("");
                  setNameerror("");
                  setNamesuccess("");
                }}
              >
                Cancel
              </button>
            </div>

            {namesuccess && <p style={{ color: "#75a4f0" }}>{namesuccess}</p>}
            {nameerror && <p style={{ color: "#d55145" }}>{nameerror}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container account">
        <div className="account-main-goal">
          {goal ? (
            <h1> {goal} </h1>
          ) : (
            <h1>
              <span className="span-set-goal" onClick={() => setSetgoal(true)}>
                Set your main goal
              </span>
            </h1>
          )}
        </div>

        <div className="account-date">
          {start_date ? (
            <p>
              Start date: <span style={{ color: "#d9e1e7" }}>{localStart}</span>
            </p>
          ) : (
            <p className="p-set-your">
              Set your
              <span
                className="outer-span-text"
                data-replace="GOAL"
                onClick={() => setSetgoal(true)}
              >
                {" "}
                <span className="inner-span-text">start date</span>
              </span>
            </p>
          )}

          {start_date && end_date ? (
            <div className="piechart">
              <PieAnimation skipAnimation />
            </div>
          ) : (
            <h1 className="pie-chart-no-data">No data provided</h1>
          )}

          {end_date ? (
            <p>
              End date: <span style={{ color: "#d9e1e7" }}> {localEnd} </span>
            </p>
          ) : (
            <p className="p-set-your">
              Set your
              <span
                className="outer-span-text"
                data-replace="GOAL"
                onClick={() => setSetgoal(true)}
              >
                {" "}
                <span className="inner-span-text">end date</span>
              </span>
            </p>
          )}
        </div>

        <div className="name-graph-box">
          <div className="account-name-skill">
            {name ? (
              <h3>
                {" "}
                Hi, <span className="skill-name">{name}</span>{" "}
              </h3>
            ) : (
              <h3>
                <span
                  className="span-set-name"
                  onClick={() => setNameform(true)}
                >
                  Set your name
                </span>
              </h3>
            )}

            {skill ? (
              <h3>
                {" "}
                your goal skill is <span className="skill-name">
                  {skill}
                </span>{" "}
              </h3>
            ) : (
              <h3>
                <span
                  className="span-set-name"
                  onClick={() => setNameform(true)}
                >
                  Set your goal skill
                </span>
              </h3>
            )}
          </div>

          <div>
            <LineChart />
          </div>
        </div>
      </div>

      {nameform && setname_form()}
      {setgoal && setmaingoal_form()}
    </>
  );
}

export default Account;
