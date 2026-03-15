import { useState, useMemo, useEffect } from "react";
import "./App.css";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(1);
  const [startCurr, setStartCurr] = useState("USD");
  const [targetCurr, setTargetCurr] = useState("EUR");
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("https://api.frankfurter.app/latest?base=USD");

        if (!res.ok) {
          throw new Error("Failed to fetch exchange rates");
        }

        const data = await res.json();

        setRates({
          USD: 1,
          ...data.rates,
        });
      } catch (err) {
        setError("Could not load exchange rates.");
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  const amountInUSD = useMemo(() => {
    if (amount === "" || !rates[startCurr]) return 0;
    return amount / rates[startCurr];
  }, [amount, startCurr, rates]);

  const convertedAmount = useMemo(() => {
    if (!rates[targetCurr]) return 0;
    return amountInUSD * rates[targetCurr];
  }, [amountInUSD, targetCurr, rates]);

  const swapCurrencies = () => {
    const currentStart = startCurr;
    setStartCurr(targetCurr);
    setTargetCurr(currentStart);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  if (loading) {
    return (
      <div className={`app ${theme}`}>
        <p className="status-message">Loading rates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`app ${theme}`}>
        <p className="status-message error">{error}</p>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <div className="container">
        <div className="top-bar">
          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>

        <h1>Currency Converter</h1>

        <p className="subtitle">
          {startCurr} to {targetCurr} Conversion
        </p>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
        />

        <label htmlFor="start-currency">Start Currency:</label>
        <select
          id="start-currency"
          value={startCurr}
          onChange={(e) => setStartCurr(e.target.value)}
        >
          {Object.keys(rates).map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="swap-btn"
          onClick={swapCurrencies}
          aria-label="Swap currencies"
        >
          <i className="fa-solid fa-right-left"></i>
        </button>

        <label htmlFor="target-currency">Target Currency:</label>
        <select
          id="target-currency"
          value={targetCurr}
          onChange={(e) => setTargetCurr(e.target.value)}
        >
          {Object.keys(rates).map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>

        <p className="convert">
          Converted Amount: {convertedAmount.toFixed(2)} {targetCurr}
        </p>
      </div>
    </div>
  );
}