import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import PieAnimation from "./chart";

import { useAuth } from "../context/AuthContext";
import { useUserdata } from "../context/Userdata";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Account() {
  const { user, isLoggedIn } = useAuth();
  const { Usermaindata, getuserdata } = useUserdata();

  const { goal, start_date, end_date } = Usermaindata;
  console.log(Usermaindata);

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
                <span className="inner-span-text">end date</span>
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
      </div>

      {setgoal && setmaingoal_form()}
    </>
  );
}

export default Account;
