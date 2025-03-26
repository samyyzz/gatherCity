import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { prisma } from "@metaverse/db/prisma";
import { Avatar, Element, SigninSchema, SignupSchema } from "../../types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET_USER } from "../../config";
import { JWT_SECRET_ADMIN } from "../../config";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log("parsed data incorrect");
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    console.log("erroer thrown");
    console.log(e);
    res.status(400).json({ message: "User already exists" });
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  let JWT_SECRET = "";
  if (!parsedData.success) {
    res.status(403).json({ message: "Validation failed" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }

    if (user.role == "Admin") {
      JWT_SECRET = JWT_SECRET_ADMIN;
    } else {
      JWT_SECRET = JWT_SECRET_USER;
    }

    const isValid = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );

    if (!isValid) {
      res.status(403).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } catch (e) {
    res.status(400).json({ message: "Internal server error" });
  }
});

router.get("/avatars", async (req, res) => {
  const avatars = await prisma.avatar.findMany();
  if (!avatars) {
    res.status(400).json({ message: "Failed to get avatars" });
    return;
  }
  const response = avatars.map((avr: Avatar) => ({
    id: avr.id,
    name: avr.name,
    imageUrl: avr.imageUrl,
  }));
  res.json(response);
});

router.get("/elements", async (req, res) => {
  try {
    const elements = await prisma.element.findMany();
    const response = elements.map((elm: Element) => ({
      id: elm.id,
      height: elm.height,
      width: elm.width,
      static: elm.static,
      imageUrl: elm.imageUrl,
    }));
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: "Failed to find elements" });
  }
});

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
