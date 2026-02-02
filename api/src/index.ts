import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import billsRouter from "./routes/bills";
import housesRouter from "./routes/houses";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/bills", billsRouter);
app.use("/api/houses", housesRouter);

app.get("/health", (_, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`=================\n
    🚀 Server running on port ${PORT}\n
    =================`);
});
