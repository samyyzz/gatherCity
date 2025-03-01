import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import { userMiddleware } from "../../middleware/user";
import { prisma } from "@metaverse/db/prisma";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedBody = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(403)
      .json({ message: "Invalid format received from client side" });
    return;
  }
  try {
    await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        avatarId: parsedBody.data?.avatarId,
      },
    });
    res.status(201).json({ message: "AvatarId updated successfully" });
  } catch (error) {
    res.status(403).json({ message: "Failed to update AvatarId" });
  }
});

userRouter.get("/metadata/bulk", async (req, res) => {
  const userIdString = (req.query.ids || []) as string;
  const userIds = JSON.parse(userIdString);
  try {
    const metadata = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        avatar: true,
        id: true,
      },
    });

    res.json({
      avatars: metadata.map((data) => ({
        avatarId: data.avatar?.id,
        userId: data.id,
      })),
    });
  } catch (error) {
    res.status(403).json({ message: "Failed to find metadata" });
  }
});
