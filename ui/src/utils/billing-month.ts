const MONTH_MAP: Record<string, string> = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

export const toBillingMonth = (monthLabel: string) => {
  if (!monthLabel || !monthLabel.includes(" ")) {
    return "";
  }
  const [monthName, year] = monthLabel.split(" ");

  const month = MONTH_MAP[monthName];
  if (!month || !year) {
    throw new Error("Invalid month label");
  }

  return `${year}-${month}-01`;
};
