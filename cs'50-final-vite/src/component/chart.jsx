import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { PieChart } from "@mui/x-charts/PieChart";
import { legendClasses } from "@mui/x-charts/ChartsLegend";

import { useAuth } from "../context/AuthContext";
import { useUserdata } from "../context/Userdata";

export default function PieAnimation() {
  const [radius, setRadius] = React.useState(80);
  const [itemNb, setItemNb] = React.useState(2);
  const [skipAnimation, setSkipAnimation] = React.useState(false);

  const { Usermaindata } = useUserdata();
  const { start_date, end_date } = Usermaindata;

  const chartData = useMemo(() => {
    if (!start_date || !end_date) return [];

    const now = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);

    const totalMs = end - start;
    const passedMs = now - start;

    const totalDays = Math.max(Math.ceil(totalMs / (1000 * 60 * 60 * 24)), 1);
    const passedDays = Math.max(
      Math.floor(passedMs / (1000 * 60 * 60 * 24)),
      0
    );
    const leftDays = Math.max(totalDays - passedDays, 0);

    return [
      { id: 0, value: passedDays, label: "Days Passed" },
      { id: 1, value: leftDays, label: "Days Left" },
    ];
  }, [start_date, end_date]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        "& .MuiPieArcLabel-root": {
          fill: "#ffffff",
          fontSize: "1rem",
          fontWeight: "bold",
          textAnchor: "middle",
          dominantBaseline: "middle",
        },
        "& .css-1f57y8b": {
          fill: "#ffffff",
          fontSize: "3rem",
          fontWeight: "bold",
        },
      }}
    >
      <PieChart
        height={300}
        width={300}
        series={[
          {
            data: chartData,
            innerRadius: radius,
            paddingAngle: 2,
            cornerRadius: 2,
            arcLabel: (params) =>
              ` ${(
                (params.value /
                  (chartData[0].value + chartData[1].value || 1)) *
                100
              ).toFixed(2)}%`,
            arcLabelMinAngle: 45,
            valueFormatter: (params) => `${params.value}`,
          },
        ]}
        slotProps={{
          legend: {
            direction: "vertical",
            position: {
              vertical: "middle",
              horizontal: "center",
            },
            sx: {
              fontSize: 20,
              color: "#ffffff",
              gap: "2rem",
              [`.${legendClasses.mark}`]: {
                height: 20,
                width: 20,
              },
            },
          },
        }}
        skipAnimation={skipAnimation}
      />
    </Box>
  );
}
