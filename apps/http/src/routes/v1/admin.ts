import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";
import { prisma } from "@metaverse/db/prisma";

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
  const parsedBody = CreateElementSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(403).json({ message: "Failed to validate" });
    return;
  }
  try {
    const newElement = await prisma.element.create({
      data: {
        imageUrl: parsedBody.data.imageUrl,
        height: parsedBody.data.height,
        width: parsedBody.data.width,
        static: parsedBody.data.static,
      },
    });
    res.status(201).json({ message: "Element created !", id: newElement.id });
  } catch (error) {
    res.status(201).json({ message: "Failed to create element!" });
  }
});

adminRouter.put("/element/:elementId", adminMiddleware, async (req, res) => {
  const parsedBody = UpdateElementSchema.safeParse(req.params.elementId);
  if (!parsedBody.success) {
    res.status(403).json({ message: "Failed to validate" });
    return;
  }
  try {
    const newElement = await prisma.element.update({
      where: {
        id: req.params.elementId,
      },
      data: {
        imageUrl: parsedBody.data.imageUrl,
      },
    });
    res.status(201).json({ message: "Element created !", id: newElement.id });
  } catch (error) {
    res.status(201).json({ message: "Failed to create element!" });
  }
});

adminRouter.post("/avatar", adminMiddleware, async (req, res) => {
  const parsedBody = CreateAvatarSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(403).json({ message: "Failed to validate" });
  }
  try {
    const avatar = await prisma.avatar.create({
      data: {
        name: parsedBody.data?.name,
        imageUrl: parsedBody.data?.imageUrl,
      },
    });
    res.status(201).json({ message: "Avatar created", avatar: avatar.id });
  } catch (error) {
    res.status(403).json({ message: "failed to create Avatar", error });
  }
});

adminRouter.post("/map", adminMiddleware, async (req, res) => {
  const parsedBody = CreateMapSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(403).json({ message: "Failed to validate" });
    return;
  }
  const mapData = parsedBody?.data;
  try {
    const newMap = await prisma.map.create({
      data: {
        width: parseInt(mapData.dimensions.split("x")[0]),
        height: parseInt(mapData.dimensions.split("x")[1]),
        name: mapData.name,
        thumbnail:mapData.thumbnail,
        mapElements: {
          create: mapData.defaultElements.map((elm) => ({
            elementId: elm.elementId,
            x: elm.x,
            y: elm.y,
          })),
        },
      },
    });
    res.status(201).json({ message: "Map created !", id: newMap.id });
  } catch (error) {
    res.status(201).json({ message: "Failed to create map!" });
  }
});
