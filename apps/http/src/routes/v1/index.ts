import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import prisma from "@metaverse/db";

export const router = Router();

router.post("/signup", (req, res) => {});

router.post("/signin", (req, res) => {});

router.get("/avatars", (req, res) => {});
router.get("/elements", (req, res) => {});

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
