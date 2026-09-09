/** Lightweight public host entry: no route UI or styles in the startup graph. */
import { useEffect } from "react";
import { retainPomodoroController } from "./internal/sessionController.js";
export function PomodoroSessionHost() { useEffect(retainPomodoroController, []); return null; }
