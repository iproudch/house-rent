import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

router.post("/:houseId", async (req, res) => {
  const { houseId } = req.params;
  const { electricity, water, rent, internet, billing_month } = req.body;

  if (!billing_month) {
    return res.status(400).json({ error: "billing_month is required" });
  }

  const { data, error } = await supabase
    .from("bills")
    .insert({
      house_id: houseId,
      billing_month,
      electricity,
      water,
      rent,
      internet,
    })
    .select()
    .single();

  if (error) {
    // duplicate PK (billing_month)
    // if (error.code === "23505") {
    //   return res.status(409).json({
    //     error: "Bill for this billing month already exists",
    //   });
    // }

    // FK violation (house_id not found)
    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid houseId",
      });
    }

    return res.status(400).json({ error: error.message });
  }

  res.status(200).json(data);
});

router.get("/prev-bill", async (req, res) => {
  const { houseId, billingMonth } = req.query as {
    houseId?: string;
    billingMonth?: string;
  };

  if (!houseId || !billingMonth) {
    return res
      .status(400)
      .json({ message: "houseId and billingMonth are required" });
  }

  const prevBillingMonth = getPreviousMonth(billingMonth);

  const { data: prevBill, error } = await supabase
    .from("bills")
    .select("*")
    .eq("house_id", houseId)
    .eq("billing_month", prevBillingMonth)
    .maybeSingle();

  if (error) {
    return res.status(500).json(error);
  }

  // 🔥 ไม่มี = null ชัดเจน
  return res.status(200).json(prevBill ?? null);
});

const getPreviousMonth = (billingMonth: string) => {
  const date = new Date(billingMonth);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 10);
};

export default router;
