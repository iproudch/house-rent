import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import billsRouter from "./routes/bills";
import housesRouter from "./routes/houses";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN?.split(",") || []).map(
  (origin) => origin.trim(),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/bills", billsRouter);
app.use("/api/houses", housesRouter);

app.get("/health", (_, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=================\n
    🚀 Server running on port ${PORT}\n
    =================`);
});
