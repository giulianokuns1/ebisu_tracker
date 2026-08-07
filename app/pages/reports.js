import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import LayoutApp from "@/Components/Layout/LayoutApp";
import PageBackButton from "@/Components/Layout/PageBackButton";
import Loading from "@/Components/UI/Loading";
import { API_BASE_URL, WEBSITE_NAME } from "@/constants";
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Dashboard/Dashboard.module.scss";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

function ReportsPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    };
    load().catch(() =>
      setData({
        monthly: [],
        categories: [],
        topExpenses: [],
        currencySymbol: "",
      })
    );
  }, []);
  if (!data)
    return (
      <LayoutApp>
        <Loading />
      </LayoutApp>
    );
  const labels = data.monthly.map((item) => item.label);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#a7b5bb" } } },
    scales: {
      x: { ticks: { color: "#839299" }, grid: { display: false } },
      y: {
        ticks: { color: "#839299" },
        grid: { color: "rgba(151,177,180,.1)" },
      },
    },
  };
  return (
    <LayoutApp>
      <Head>
        <title>{`Reports | ${WEBSITE_NAME}`}</title>
      </Head>
      <div className={styles.dashboard}>
        <header className={styles.dashboardHeader}>
          <div>
            <p className={styles.eyebrow}>Financial intelligence</p>
            <div className={styles.titleRow}><PageBackButton /><h1>Reports</h1></div>
            <p className={styles.subtitle}>
              Review your expense, income, and cash-flow trends.
            </p>
          </div>
        </header>
        <section className={styles.visualGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Expenses by category</p>
                <h2>Where your money goes</h2>
              </div>
            </div>
            <div className={styles.lineChart}>
              <Doughnut
                data={{
                  labels: data.categories.map((item) => item.name),
                  datasets: [
                    {
                      data: data.categories.map((item) => item.amount),
                      backgroundColor: [
                        "#4fd6be",
                        "#a78bfa",
                        "#f29b4b",
                        "#5ac6ee",
                        "#ef6b7a",
                      ],
                    },
                  ],
                }}
              />
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Expenses vs income</p>
                <h2>Monthly comparison</h2>
              </div>
            </div>
            <div className={styles.lineChart}>
              <Bar
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Expenses",
                      data: data.monthly.map((item) => item.expenses),
                      backgroundColor: "#ef6b7a",
                    },
                    {
                      label: "Income",
                      data: data.monthly.map((item) => item.income),
                      backgroundColor: "#4fd6be",
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </section>
        <section className={styles.visualGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Cash flow</p>
                <h2>Income minus expenses</h2>
              </div>
            </div>
            <div className={styles.lineChart}>
              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Cash flow",
                      data: data.monthly.map(
                        (item) => item.income - item.expenses
                      ),
                      borderColor: "#4fd6be",
                      backgroundColor: "rgba(79,214,190,.15)",
                      fill: true,
                      tension: 0.35,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Top expenses</p>
                <h2>Category ranking</h2>
              </div>
            </div>
            <div className={styles.legend}>
              {data.topExpenses.map((item) => (
                <div className={styles.legendRow} key={item.name}>
                  <span className={`${styles.legendDot} ${styles.pending}`} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {data.currencySymbol} {Number(item.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </LayoutApp>
  );
}

export default withAuth(ReportsPage);
