import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("houses")
    .select("*");

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  data.sort((a, b) =>
    String(a.name).localeCompare(String(b.name), undefined, { numeric: true })
  );
  return res.json(data);
});

export default router;
