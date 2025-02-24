import express from "express";
import { router } from "./routes/v1";
import prisma from "@metaverse/db";

const app = express()

app.use("/api/v1", router)

app.use(express.json())

