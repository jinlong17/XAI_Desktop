import { useCalendarStore } from "../hooks/useCalendarStore";
import { CalendarDay } from "./CalendarDay";
import { CalendarMini } from "./CalendarMini";

export function CalendarWidget() {
  const store = useCalendarStore();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
      <CalendarMini month={store.month} events={store.events} selectedDate={store.selectedDate} onSelectDate={store.selectDate} />
      <CalendarDay date={store.selectedDate} events={store.events} />
    </div>
  );
}
