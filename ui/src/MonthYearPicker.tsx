import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { MONTHS } from "./constants/month";


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
          className={`w-full px-4 py-2.5 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 text-sm ${
            isOpen ? "border-indigo-400 ring-4 ring-indigo-400/10" : "border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-normal text-slate-900">{formatDisplay()}</span>
          <Calendar
            size={18}
            className={`text-indigo-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-xl z-50">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all duration-200 active:scale-95"
                onClick={() => setViewYear((prev) => prev - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-slate-800">{viewYear}</span>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all duration-200 active:scale-95"
                onClick={() => setViewYear((prev) => prev + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  className={`py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 active:scale-95 ${
                    selectedMonth === index && selectedYear === viewYear
                      ? "bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-200"
                      : "bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
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
