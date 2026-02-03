import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import BillFormProvider, { type IBillForm } from "./BillFormProvider";
import { useFormContext } from "react-hook-form";
import { useHouses } from "../../hooks/useHouses";
import MonthYearPicker from "../../MonthYearPicker";
import { usePreviousBill } from "../../hooks/usePreviousBill";
import { toBillingMonth } from "../../utils/billing-month";
import type { IBill } from "../../../@types/bill";

export default function BillForm(): ReactElement {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <BillFormProvider formRef={formRef}>
      <BillFormContent />
    </BillFormProvider>
  );
}

function BillFormContent() {
  const { register, setValue, watch } = useFormContext<IBillForm>();
  const [billingMonth, setBillingMonth] = useState(
    new Date().toISOString().slice(0, 7) + "-01",
  );

  const houseId = watch("houseId");
  const prevWaterUnit = watch("prevWaterUnit") || 0;
  const prevElectricityUnit = watch("prevElectricityUnit") || 0;

  const { data: houseUsers } = useHouses();

  const waterRateUnit = useMemo(() => {
    const user = houseUsers?.find((house) => house.id === houseId);
    return user?.water_unit_base || 0;
  }, [houseId, houseUsers]);

  const electricityRateUnit = useMemo(() => {
    const user = houseUsers?.find((house) => house.id === houseId);
    return user?.electricity_unit_base || 0;
  }, [houseId, houseUsers]);

  const onSelectHouseUser = (houseId: string) => {
    const user = houseUsers?.find((house) => house.id === houseId);
    if (!user) return;
    setValue("rent", user.rent_base);
    setValue("internet", user.internet_base || 0);
  };

  const onChangeBillingMonth = () => {
    setValue("billingMonth", billingMonth);
  };

  const onChangeWaterUnit = (current: number) => {
    const useUnit = current - prevWaterUnit;
    const use = useUnit * waterRateUnit;
    setValue("waterUsage", use);
  };

  const onChangeElectricityUnit = (current: number) => {
    const useUnit = current - prevElectricityUnit;
    const use = useUnit * electricityRateUnit;
    setValue("electricityUsage", use);
  };

  const { data: prevBill } = usePreviousBill({
    houseId,
    billingMonth: toBillingMonth(billingMonth),
  });

  useEffect(() => {
    if (!prevBill) {
      setValue("prevWaterUnit", 0);
      setValue("prevWaterUsage", 0);
      setValue("prevElectricityUnit", 0);
      setValue("prevElectricityUsage", 0);
      return;
    }
    const prevBillData = prevBill as unknown as IBill;
    setValue("prevWaterUnit", prevBillData?.water_unit || 0);
    setValue("prevWaterUsage", prevBillData?.water_usage || 0);
    setValue("prevElectricityUnit", prevBillData?.electricity_unit || 0);
    setValue("prevElectricityUsage", prevBillData?.electricity_usage || 0);
  }, [prevBill, setValue]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-zinc-900 mb-2 tracking-tight">
            Bill Management
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm">
          <div className="space-y-6">
            <div className="flex flex-col items-start">
              <label
                htmlFor="houseId"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
                House ID
              </label>
              <select
                id="houseId"
                {...register("houseId")}
                required
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2318181B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                }}
                onChange={(e) => onSelectHouseUser(e.currentTarget.value)}
              >
                {houseUsers?.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.id} {house.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-start">
              <label
                htmlFor="houseId"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
                Billing Month
              </label>
              <MonthYearPicker
                setValue={setBillingMonth}
                onChange={() => onChangeBillingMonth()}
              />
            </div>

            <div className="flex flex-col items-start">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Previous Water Meter Unit
                  </label>
                  <input
                    type="number"
                    {...register("prevWaterUnit")}
                    disabled
                    placeholder="Unit"
                    className="w-full px-4 py-3 bg-gray-100 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Previous Water Usage
                  </label>
                  <input
                    type="number"
                    placeholder="Usage"
                    {...register("prevWaterUsage")}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Water Meter Unit
                  </label>
                  <input
                    type="number"
                    id="waterUnit"
                    {...register("waterUnit")}
                    onChange={(e) => onChangeWaterUnit(Number(e.target.value))}
                    placeholder="Unit"
                    required
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Water Usage
                  </label>
                  <input
                    type="text"
                    id="waterUse"
                    placeholder="Usage"
                    {...register("waterUsage")}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                  <p className="px-2 py-1 text-xs text-zinc-500">
                    calculate at {waterRateUnit}฿ per unit
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Previous Electricity Meter Unit
                  </label>
                  <input
                    type="number"
                    {...register("prevElectricityUnit")}
                    disabled
                    placeholder="Unit"
                    className="w-full px-4 py-3 bg-gray-100 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Previous Electricity Usage
                  </label>
                  <input
                    type="number"
                    placeholder="Usage"
                    {...register("prevElectricityUsage")}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Electricity Meter Unit
                  </label>
                  <input
                    type="number"
                    id="electricityUnit"
                    {...register("electricityUnit")}
                    onChange={(e) =>
                      onChangeElectricityUnit(Number(e.target.value))
                    }
                    placeholder="Unit"
                    required
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Electricity Usage
                  </label>
                  <input
                    type="text"
                    id="electricityUse"
                    placeholder="Usage"
                    {...register("electricityUsage")}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
                  />
                  <p className="px-2 py-1 text-xs text-zinc-500">
                    calculate at {electricityRateUnit}฿ per unit
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <label
                htmlFor="internet"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
                Internet
              </label>
              <input
                type="text"
                id="internet"
                {...register("internet")}
                placeholder="Enter amount"
                required
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col items-start">
              <label
                htmlFor="rent"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
                Rent
              </label>
              <input
                type="text"
                id="rent"
                {...register("rent")}
                placeholder="Enter amount"
                required
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-900 text-white font-medium text-sm rounded-xl hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-zinc-400 text-xs tracking-wider font-mono">
          COPYRIGHT © 2026 - PROUD CH
        </div>
      </div>
    </div>
  );
}
