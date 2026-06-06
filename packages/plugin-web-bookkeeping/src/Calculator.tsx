import { useCallback, useEffect, useState } from "react";
import { Icon } from "./internal/icons.js";

export interface CalculatorProps {
  readonly symbol: string;
  readonly initial?: string;
  readonly onChange: (value: string) => void;
  readonly onConfirm: () => void;
}

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function compute(left: number, right: number, op: string | null): number {
  if (op === "+") return left + right;
  if (op === "-") return left - right;
  if (op === "x") return left * right;
  if (op === "/") return right === 0 ? 0 : left / right;
  return right;
}

export function Calculator({ symbol, initial = "", onChange, onConfirm }: CalculatorProps) {
  const [cur, setCur] = useState(initial || "0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(true);

  useEffect(() => {
    onChange(cur);
  }, [cur, onChange]);

  const inputDigit = useCallback(
    (digit: string) => {
      setCur((value) => {
        if (overwrite || value === "0") {
          setOverwrite(false);
          return digit;
        }
        if (value.replace(/[^0-9]/g, "").length >= 12) return value;
        return `${value}${digit}`;
      });
    },
    [overwrite],
  );

  const inputDot = useCallback(() => {
    setCur((value) => {
      if (overwrite) {
        setOverwrite(false);
        return "0.";
      }
      return value.includes(".") ? value : `${value}.`;
    });
  }, [overwrite]);

  const clearAll = useCallback(() => {
    setCur("0");
    setPrev(null);
    setOp(null);
    setOverwrite(true);
  }, []);

  const backspace = useCallback(() => {
    setCur((value) => {
      if (overwrite || value.length <= 1 || (value.length === 2 && value.startsWith("-"))) {
        setOverwrite(true);
        return "0";
      }
      return value.slice(0, -1);
    });
  }, [overwrite]);

  const chooseOp = useCallback(
    (nextOp: string) => {
      const curValue = Number(cur || 0);
      if (op && !overwrite && prev !== null) {
        const result = round(compute(prev, curValue, op));
        setPrev(result);
        setCur(String(result));
      } else {
        setPrev(curValue);
      }
      setOp(nextOp);
      setOverwrite(true);
    },
    [cur, op, overwrite, prev],
  );

  const equals = useCallback(() => {
    if (!op || prev === null) return;
    const result = round(compute(prev, Number(cur || 0), op));
    setCur(String(result));
    setPrev(null);
    setOp(null);
    setOverwrite(true);
  }, [cur, op, prev]);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key >= "0" && event.key <= "9") {
        inputDigit(event.key);
        event.preventDefault();
      } else if (event.key === ".") {
        inputDot();
        event.preventDefault();
      } else if (event.key === "+") {
        chooseOp("+");
        event.preventDefault();
      } else if (event.key === "-") {
        chooseOp("-");
        event.preventDefault();
      } else if (event.key === "*") {
        chooseOp("x");
        event.preventDefault();
      } else if (event.key === "/") {
        chooseOp("/");
        event.preventDefault();
      } else if (event.key === "=") {
        equals();
        event.preventDefault();
      } else if (event.key === "Enter") {
        if (op) equals();
        else onConfirm();
        event.preventDefault();
      } else if (event.key === "Backspace") {
        backspace();
        event.preventDefault();
      } else if (event.key === "Escape") {
        clearAll();
        event.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backspace, chooseOp, clearAll, equals, inputDigit, inputDot, onConfirm, op]);

  const opButton = (label: string, value: string) => (
    <button type="button" className={`bkc-key bkc-op ${op === value && overwrite ? "active" : ""}`} onClick={() => chooseOp(value)}>
      {label}
    </button>
  );

  return (
    <div className="bkc">
      <div className="bkc-screen">
        <div className="bkc-expr mono">{op ? `${prev ?? 0} ${op}` : ""}</div>
        <div className="bkc-display mono">
          <span className="bkc-sym">{symbol}</span>
          <span className="bkc-num">{cur}</span>
        </div>
      </div>
      <div className="bkc-pad">
        <button type="button" className="bkc-key bkc-fn" onClick={clearAll}>AC</button>
        <button type="button" className="bkc-key bkc-fn" onClick={() => setCur((value) => (value.startsWith("-") ? value.slice(1) : value === "0" ? value : `-${value}`))}>±</button>
        <button type="button" className="bkc-key bkc-fn" onClick={() => setCur((value) => String(round(Number(value || 0) / 100)))}>%</button>
        {opButton("÷", "/")}
        {["7", "8", "9"].map((digit) => <button key={digit} type="button" className="bkc-key" onClick={() => inputDigit(digit)}>{digit}</button>)}
        {opButton("×", "x")}
        {["4", "5", "6"].map((digit) => <button key={digit} type="button" className="bkc-key" onClick={() => inputDigit(digit)}>{digit}</button>)}
        {opButton("-", "-")}
        {["1", "2", "3"].map((digit) => <button key={digit} type="button" className="bkc-key" onClick={() => inputDigit(digit)}>{digit}</button>)}
        {opButton("+", "+")}
        <button type="button" className="bkc-key" onClick={() => inputDigit("0")}>0</button>
        <button type="button" className="bkc-key" onClick={inputDot}>.</button>
        <button type="button" className="bkc-key bkc-back" onClick={backspace}><Icon name="arrowL" size={18} /></button>
        {op ? (
          <button type="button" className="bkc-key bkc-eq" onClick={equals}>=</button>
        ) : (
          <button type="button" className="bkc-key bkc-eq bkc-confirm" onClick={onConfirm}><Icon name="check2" size={20} /></button>
        )}
      </div>
    </div>
  );
}
