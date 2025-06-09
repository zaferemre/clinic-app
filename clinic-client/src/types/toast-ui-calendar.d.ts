declare module "@toast-ui/calendar" {
  // Force import from the real JS file and attach a generic `any` fallback
  const Calendar: typeof import("@toast-ui/calendar").default;
  export default Calendar;
}
