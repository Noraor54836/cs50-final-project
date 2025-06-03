import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useUserdata } from "../context/Userdata";

import { Chart as ChartJS, plugins, defaults } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { Tooltip } from "@mui/material";

function LineChart() {
  const { Userhistory, getuserhistory } = useUserdata();
  const [Userhistorydata, setUserhistorydata] = useState({});

  defaults.plugins.title.display = true;
  defaults.plugins.title.align = "start";
  defaults.plugins.title.font.size = 25;
  defaults.plugins.title.color = "white";

  useEffect(() => {
    if (!Userhistory || Object.keys(Userhistory).length === 0) {
      console.log("no data");
      getuserhistory();
    }

    console.log("useEffect check userhistory", Userhistory);
    setUserhistorydata(Userhistory);
  }, [Userhistory]);

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

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [data, setData] = useState(() => {
    return Userhistorydata[year]?.[month] || [];
  });

  const monthskey = useMemo(() => {
    return Userhistorydata[year] ? Object.keys(Userhistorydata[year]) : [];
  }, [Userhistorydata, year]);

  const togglemonth = (monthnum) => {
    setMonth(Number(monthnum));
  };

  useEffect(() => {
    const monthdata = Userhistorydata[year]?.[month] || [];
    setData(monthdata);
  }, [Userhistorydata, year, month]);

  const option = {
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 20,
          },
        },
      },
      title: {
        text: "Monthly time spent",
      },
      tooltip: {
        titleFont: {
          size: 20,
        },
        bodyFont: {
          size: 20,
        },
        footerFont: {
          size: 22,
        },
        callbacks: {
          beforeTitle: function (context) {
            const item = data[context[0].dataIndex];
            const time = new Date(item.checkin);

            const day = time.getDay();
            const date = time.getDate();
            const month = time.getMonth();
            const year = time.getFullYear();

            const monthname = months[month];
            const dayname = days[day];
            const dateformat = `${dayname}, ${date} ${monthname} ${year}`;
            const timecheckin = time.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return `check in date: ${dateformat}\ncheck in time: ${timecheckin}`;
          },
          title: function (context) {
            const item = data[context[0].dataIndex];

            const lastspent =
              context[0].dataIndex === 0
                ? item.time_spent
                : data[context[0].dataIndex - 1].time_spent;

            const timespent = item.time_spent;
            const percentage = Math.floor(
              ((timespent - lastspent) * 100) / lastspent
            );

            return `percentage increseased: ${percentage}%`;
          },
          afterTitle: function (context) {
            const item = data[context[0].dataIndex];
            const time = new Date(item.checkout);

            const day = time.getDay();
            const date = time.getDate();
            const month = time.getMonth();
            const year = time.getFullYear();

            const monthname = months[month];
            const dayname = days[day];
            const dateformat = `${dayname}, ${date} ${monthname} ${year}`;
            const timecheckout = time.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return `check out date: ${dateformat}\ncheck out time: ${timecheckout}`;
          },
          afterLabel: function (context) {
            return "==========================";
          },
          beforeFooter: function (context) {
            const item = data[context[0].dataIndex];
            const total_time = item.checktime;

            return `total time spend: ${total_time}`;
          },
        },
      },
    },
  };

  return (
    <div className="line-chart">
      <div className="month-option">
        <select
          className="month-select"
          onChange={(e) => togglemonth(e.target.value)}
        >
          {monthskey.length === 0 ? (
            <option disabled selected>
              No data available
            </option>
          ) : (
            monthskey.map((monthk) => (
              <option
                key={monthk}
                value={monthk}
                selected={month === Number(monthk)}
              >
                {months[monthk]}
              </option>
            ))
          )}
        </select>
      </div>
      <Line
        data={{
          labels: data.map((items) => items.date),
          datasets: [
            {
              label: "time spent in seconds",
              data: data.map((items) => items.time_spent),
              backgroundColor: "white",
              borderColor: "white",
              tension: 0.1,
            },
          ],
        }}
        options={option}
      />
    </div>
  );
}

export default LineChart;
