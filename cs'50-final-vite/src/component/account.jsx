import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Account() {
  const { user, isLoggedIn } = useAuth();

  const [userdata, setUserdata] = useState({});
  const { goal, start_date, end_date } = userdata;

  const localStart = useMemo(
    () => (start_date ? new Date(start_date).toLocaleString() : ""),
    [start_date]
  );
  const localEnd = useMemo(
    () => (end_date ? new Date(end_date).toLocaleString() : ""),
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

  const getuserdata = async () => {
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
      console.log(res);
      if (res.status === 200) {
        setUserdata(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getuserdata();
  }, []);

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
        getuserdata();
        setFormsuccess("Add goal successfully");

        setTimeout(() => {
          setSetgoal(false);
          setFormsuccess("");
        }, 1500);
      }
      console.log(res);
    } catch (err) {
      console.error(err);
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
          <h1>Set your main goal</h1>
          <input
            type="text"
            value={goalinput}
            onChange={(e) => setGoalinput(e.target.value)}
            placeholder="Enter your goal"
            required
          />

          <label>Start date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label>End date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <button className="btn" onClick={sendgoal}>
            Submit
          </button>
          <button
            className="btn"
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
          {formsuccess && <p>{formsuccess}</p>}
          {formerror && <p>{formerror}</p>}
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
          {startDate ? (
            <p>Start date: {localStart}</p>
          ) : (
            <p>
              <span onClick={() => setSetgoal(true)}>Set your start date</span>
            </p>
          )}
          {endDate ? (
            <p>End date: {localEnd}</p>
          ) : (
            <p>
              <span onClick={() => setSetgoal(true)}>Set your end date</span>
            </p>
          )}
        </div>
      </div>

      {setgoal && setmaingoal_form()}
    </>
  );
}

export default Account;
