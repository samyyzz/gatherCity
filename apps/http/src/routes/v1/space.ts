import { Router } from "express";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
  Space,
  SpaceElement,
} from "../../types";
import { userMiddleware } from "../../middleware/user";
import { prisma } from "@metaverse/db/prisma";

export const spaceRouter = Router();

//create a space
spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsedBody = CreateSpaceSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(401).json({ message: "Faield to validate" });
    return;
  }
  if (!parsedBody.data.mapId) {
    const createNewSpace = await prisma.space.create({
      data: {
        name: parsedBody.data.name,
        width: parseInt(parsedBody.data.dimensions.split("x")[0]),
        height: parseInt(parsedBody.data.dimensions.split("x")[1]),
        creatorId: req.userId!,
        thumbnail: "not provided",
        spaceElements: {},
      },
    });
    res.status(201).json({
      message: "New space created successfully",
      spaceId: createNewSpace.id,
    });
  }
  const myMap = await prisma.map.findUnique({
    where: {
      id: parsedBody.data.mapId,
    },
    select: {
      mapElements: true,
      height: true,
      width: true,
    },
  });
  if (!myMap) {
    res.status(201).json({ message: "Map not found" });
    return;
  }
  try {
    const space = await prisma.$transaction(async () => {
      const createMySpace = await prisma.space.create({
        data: {
          name: parsedBody.data.name,
          width: myMap.width,
          height: myMap.height,
          creatorId: req.userId!,
        },
      });
      await prisma.spaceElements.createMany({
        data: myMap.mapElements.map((elm: SpaceElement) => ({
          elementId: elm.elementId,
          spaceId: createMySpace.id,
          x: elm.x! as number, //might throw error in future
          y: elm.y as number, //might throw error in future
        })),
      });
      return createMySpace;
    });
    res.status(201).json({
      message: "New space created successfully",
      spaceId: space.id,
    });
  } catch (error) {
    res.status(401).json({ message: "Failed to create space" });
  }
});

//delete a space
spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  const spaceId = req.params.spaceId as string;
  if (!spaceId) {
    res.status(401).json({ message: "Failed to validate" });
    return;
  }
  const space = await prisma.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    select: {
      creatorId: true,
    },
  });

  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  if (space?.creatorId !== req.userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  try {
    await prisma.space.delete({
      where: {
        id: space?.creatorId,
      },
    });
    res.status(201).json({ message: "Space deleted successfully" });
  } catch (error) {
    res.status(401).json({ message: "Failed to delete" });
  }
});

//get all spaces
spaceRouter.get("/all", userMiddleware, async (req, res) => {
  try {
    const mySpaces = await prisma.space.findMany({
      where: {
        creatorId: req.userId,
      },
    });
    res.status(201).json({
      "My Spaces": mySpaces.map((space: Space) => ({
        id: space.id,
        name: space.name,
        dimension: `${space.width}x${space.height}`,
        thumbnail: space.thumbnail,
      })),
    });
  } catch (error) {
    res.status(403).json({ message: "Failed to get spaces" });
  }
});

//add an element inside the space
spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedBody = AddElementSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(401).json({ message: "Failed to validate" });
    return;
  }
  const space = await prisma.space.findUnique({
    where: {
      id: parsedBody.data.spaceId,
      creatorId: req.userId,
    },
  });
  if (!space) {
    res.status(400).json({ message: "Space not found" });
  }
  try {
    const addElementToSpace = await prisma.spaceElements.create({
      data: {
        elementId: parsedBody.data.elementId,
        spaceId: parsedBody.data.spaceId,
        x: parsedBody.data.x,
        y: parsedBody.data.y,
      },
    });
    res
      .status(200)
      .json({ addedElement: addElementToSpace, message: "Element added" });
  } catch (error) {
    res.status(401).json({ message: "Failed to add element" });
  }
});

//delete an element from the space
spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  const parsedBody = DeleteElementSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(401).json({ message: "Failed to validate" });
    return;
  }
  const spaceElements = await prisma.spaceElements.findFirst({
    where: {
      id: parsedBody.data.id,
    },
    include: {
      space: true,
    },
  });

  if (
    !spaceElements?.space.creatorId ||
    spaceElements?.space.creatorId !== req.userId
  ) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  try {
    await prisma.spaceElements.delete({
      where: {
        id: parsedBody.data.id,
      },
    });
    res.status(200).json({ message: "Element deleted successfully" });
  } catch (error) {
    res.status(403).json({ message: "Failed to delete element" });
  }
});

//get a single space
spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
  const spaceId = req.params.spaceId;
  const space = await prisma.space.findFirst({
    where: {
      id: spaceId,
    },
    include: {
      spaceElements: {
        include: {
          element: true,
        },
      },
    },
  });

  if (!space) {
    res.status(400).json({ message: "No space found" });
  }

  res.status(200).json({
    dimensions: `${space?.width}x${space?.height}`,
    space: space?.spaceElements.map((elm: SpaceElement) => ({
      id: elm.id,
      x: elm.x,
      y: elm.y,
      element: {
        id: elm.element?.id,
        imageUrl: elm.element?.imageUrl,
        width: elm.element?.width,
        height: elm.element?.height,
        static: elm.element?.static,
      },
    })),
  });
});
