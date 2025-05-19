import React from "react";
import { useState, useEffect } from "react";
import { useUserdata } from "../context/Userdata";

import { chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";

function LineChart() {
  const { Userhistory, getuserhistory } = useUserdata();

  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [label, setLabel] = useState([]);
  const [data, setData] = useState([]);

  const [chartData, setChartData] = useState([
    {
      label: "time spent",
      data: [],
      backgroundColor: "#191929",
      borderColor: "white",
      tension: 0.1,
    },
  ]);
}
