import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { IBill } from "../@types/bill";
import type { UpdateBillPayload } from "./api/bills";
import { useBillsByHouse } from "./hooks/useBillsByHouse";
import { useHouses } from "./hooks/useHouses";
import { useUpdateBill } from "./hooks/useUpdateBill";
import { MONTHS_TH_SHORT } from "./constants/month";

const formatBillingMonth = (iso: string) => {
  if (!iso) return "-";
  const [year, month] = iso.split("-");
  return `${MONTHS_TH_SHORT[parseInt(month, 10) - 1]} ${year}`;
};

const formatCurrency = (n?: number) =>
  n != null ? n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-";

type EditForm = {
  billingMonth: string;
  electricityUnit: string;
  waterUnit: string;
  electricityUsage: string;
  waterUsage: string;
  rent: string;
  internet: string;
  total: string;
};

const billToEditForm = (bill: IBill): EditForm => ({
  billingMonth: bill.billingMonth ?? "",
  electricityUnit: String(bill.electricityUnit ?? ""),
  waterUnit: String(bill.waterUnit ?? ""),
  electricityUsage: String(bill.electricityUsage ?? ""),
  waterUsage: String(bill.waterUsage ?? ""),
  rent: String(bill.rent ?? ""),
  internet: String(bill.internet ?? ""),
  total: String(bill.total ?? ""),
});

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

export default function ManagePage() {
  const { t } = useTranslation();
  const { data: houses } = useHouses();
  const [selectedHouseId, setSelectedHouseId] = useState<string>("");
  const [editingBill, setEditingBill] = useState<IBill | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: bills, isLoading } = useBillsByHouse(selectedHouseId || undefined);
  const { mutate: updateBill, isPending: isSaving } = useUpdateBill(selectedHouseId || undefined);

  const totalAmount = bills?.reduce((sum, b) => sum + (b.total ?? 0), 0) ?? 0;
  const avgAmount = bills && bills.length > 0 ? totalAmount / bills.length : 0;
  const maxBill = bills?.reduce<IBill | null>(
    (max, b) => (max == null || (b.total ?? 0) > (max.total ?? 0) ? b : max),
    null,
  );

  const openEdit = (bill: IBill) => {
    setEditingBill(bill);
    setEditForm(billToEditForm(bill));
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditingBill(null);
    setEditForm(null);
    setSaveError(null);
  };

  const handleFormChange = (field: keyof EditForm, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = () => {
    if (!editingBill || !editForm) return;

    const payload: UpdateBillPayload = {
      billingMonth: editForm.billingMonth,
      electricityUnit: parseFloat(editForm.electricityUnit) || 0,
      waterUnit: parseFloat(editForm.waterUnit) || 0,
      electricityUsage: parseFloat(editForm.electricityUsage) || 0,
      waterUsage: parseFloat(editForm.waterUsage) || 0,
      rent: parseFloat(editForm.rent) || 0,
      internet: parseFloat(editForm.internet) || 0,
      total: parseFloat(editForm.total) || 0,
    };

    updateBill(
      { id: editingBill.id, payload },
      {
        onSuccess: closeEdit,
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
          setSaveError(msg);
        },
      },
    );
  };

  const inputCls =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all";

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {t("manage.title")}
          </h1>
        </div>

        {/* House Selector */}
        <div className="mb-6">
          <label htmlFor="houseSelect" className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
            {t("bill.house")}
          </label>
          <select
            id="houseSelect"
            className="w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all appearance-none cursor-pointer card-shadow"
            value={selectedHouseId}
            onChange={(e) => setSelectedHouseId(e.target.value)}
          >
            <option value="">{t("bill.selectHouse")}</option>
            {houses?.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {selectedHouseId && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard
                label={t("manage.totalBills")}
                value={String(bills?.length ?? 0)}
                sub={t("manage.records")}
              />
              <StatCard
                label={t("manage.totalAmount")}
                value={`฿${formatCurrency(totalAmount)}`}
                sub={t("manage.allTime")}
              />
              <StatCard
                label={t("manage.avgMonthly")}
                value={`฿${formatCurrency(avgAmount)}`}
                sub={maxBill ? `สูงสุด: ฿${formatCurrency(maxBill.total)} (${formatBillingMonth(maxBill.billingMonth)})` : "-"}
              />
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : !bills || bills.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                  {t("manage.noData")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {[
                          t("bill.billingMonth"),
                          t("manage.elecUnit"),
                          t("manage.waterUnit"),
                          t("manage.elecUsage"),
                          t("manage.waterUsage"),
                          t("bill.rent"),
                          t("bill.internet"),
                          t("manage.total"),
                          t("manage.action"),
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap first:pl-5 last:text-center"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="px-4 py-3 pl-5 font-semibold text-slate-800 whitespace-nowrap">
                            {formatBillingMonth(bill.billingMonth)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {bill.electricityUnit?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {bill.waterUnit?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {bill.electricityUsage?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {bill.waterUsage?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            ฿{formatCurrency(bill.rent)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            ฿{formatCurrency(bill.internet)}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                            ฿{formatCurrency(bill.total)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEdit(bill)}
                              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                              {t("manage.edit")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedHouseId && (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">
            {t("manage.selectHousePrompt")}
          </div>
        )}

        {/* Edit Modal */}
        {editingBill && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full cursor-default"
              onClick={closeEdit}
            />
            <div className="relative bg-white rounded-3xl card-shadow w-full max-w-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  {t("manage.editTitle")} — {formatBillingMonth(editingBill.billingMonth)}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label htmlFor="editBillingMonth" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t("bill.billingMonth")}
                  </label>
                  <input
                    id="editBillingMonth"
                    type="date"
                    disabled
                    className={inputCls}
                    value={editForm.billingMonth}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editElecUnit" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("manage.elecUnit")}
                    </label>
                    <input
                      id="editElecUnit"
                      type="number"
                      step="any"
                      className={inputCls}
                      value={editForm.electricityUnit}
                      onChange={(e) => handleFormChange("electricityUnit", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="editWaterUnit" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("manage.waterUnit")}
                    </label>
                    <input
                      id="editWaterUnit"
                      type="number"
                      step="any"
                      className={inputCls}
                      value={editForm.waterUnit}
                      onChange={(e) => handleFormChange("waterUnit", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editElecUsage" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("manage.elecUsage")}
                    </label>
                    <input
                      id="editElecUsage"
                      type="number"
                      step="any"
                      className={inputCls}
                      value={editForm.electricityUsage}
                      onChange={(e) => handleFormChange("electricityUsage", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="editWaterUsage" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("manage.waterUsage")}
                    </label>
                    <input
                      id="editWaterUsage"
                      type="number"
                      step="any"
                      className={inputCls}
                      value={editForm.waterUsage}
                      onChange={(e) => handleFormChange("waterUsage", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editRent" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("bill.rent")}
                    </label>
                    <input
                      id="editRent"
                      type="number"
                      step="any"
                      className={inputCls}
                      value={editForm.rent}
                      onChange={(e) => handleFormChange("rent", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="editInternet" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {t("bill.internet")}
                    </label>
                    <input
                      id="editInternet"
                      type="number"
                      step="any"
                      className={inputCls}
                      value={editForm.internet}
                      onChange={(e) => handleFormChange("internet", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="editTotal" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t("manage.total")}
                  </label>
                  <input
                    id="editTotal"
                    type="number"
                    step="any"
                    className={inputCls}
                    value={editForm.total}
                    onChange={(e) => handleFormChange("total", e.target.value)}
                  />
                </div>

                {saveError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {saveError}
                  </p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {t("manage.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-semibold btn-primary text-white rounded-xl disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {isSaving ? t("manage.saving") : t("manage.save")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-10 text-white/20 text-xs tracking-widest font-mono">
          COPYRIGHT © 2026 - PROUD CH
        </div>
      </div>
    </div>
  );
}
