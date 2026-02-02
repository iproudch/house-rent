import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

export default router;
