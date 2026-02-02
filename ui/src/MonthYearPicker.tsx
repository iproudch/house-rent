import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type MonthYearPickerProps = {
  label?: string;
  setValue: (value: string) => void;
  onChange: () => void;
};
export default function MonthYearPicker(
  props: MonthYearPickerProps,
): ReactElement {
  const { label, setValue, onChange } = props;
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setIsOpen(false);
    setValue(formatDisplay());
    onChange();
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setViewYear(year);
    setValue(formatDisplay());
    onChange();
  };

  const formatDisplay = useCallback(() => {
    return `${MONTHS[selectedMonth]} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setValue(formatDisplay());
  }, [formatDisplay, setValue]);

  return (
    <div className="w-full max-w-sm">
      {label ? (
        <div className="text-md font-medium text-slate-600 mb-4">{label} </div>
      ) : null}

      <div className="relative">
        <button
          type="button"
          className={`w-full px-4 py-4 bg-white border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
            isOpen ? "border-blue-100 shadow-md" : "border-stone-200"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-n font-normal text-slate-900">
            {formatDisplay()}
          </span>
          <Calendar
            size={24}
            className={`text-blue-500 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-xl z-50">
            <div className="flex items-center justify-between mb-3 pb-2.5 ">
              <button
                type="button"
                className="w-9 h-9 rounded-lg bg-blue-100 text-slate-900 hover:bg-blue-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => setViewYear((prev) => prev - 1)}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-xl font-semibold text-slate-900">
                {viewYear}
              </div>

              <button
                type="button"
                className="w-9 h-9 rounded-lg bg-blue-100 text-slate-900 hover:bg-blue-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => setViewYear((prev) => prev + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {MONTHS.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  className={`px-2 py-2.5 border-1 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                    selectedMonth === index && selectedYear === viewYear
                      ? "bg-blue-100 border-blue-200 text-zinc-900 font-medium "
                      : "bg-white border-stone-200 text-slate-900"
                  }`}
                  onClick={() => {
                    handleMonthSelect(index);
                    handleYearSelect(viewYear);
                  }}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
