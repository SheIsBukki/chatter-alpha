export const formatDateToLocal = (dateStr: string, locale: string) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const regularDate = (dateValue: string | number | Date) => {
  return new Date(dateValue).toLocaleDateString("en-uk", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
