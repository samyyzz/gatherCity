import z from "zod";

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
      role?: "ADMIN" | "USER";
    }
  }
}

export interface Avatar {
  id: string;
  name: string | null;
  imageUrl: string | null;
}

export interface Element {
  id: string;
  height: number;
  width: number;
  static: boolean;
  imageUrl: string;
}

export interface DefaultElements {
  id: string;
  elementId: string;
  mapId: string;
  x: number | null;
  y: number | null;
  element?: Element;
}

export interface SpaceElement {
  id: string;
  x: number;
  y: number;
  element: Element
}
export interface Metadata {
  avatar: {
    id: string 
  } | null;
  id: string;
}
export interface Space {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnail: string | null;
}

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string(),
  type: z.enum(["admin", "user"]),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const UpdateMetadataSchema = z.object({
  avatarId: z.string(),
});

export const CreateSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}×[0-9]{1,4}$/),
  mapId: z.string().optional(),
});

export const AddElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});

export const DeleteElementSchema = z.object({
  id: z.string(),
});

export const CreateElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const UpdateElementSchema = z.object({
  imageUrl: z.string(),
});

export const CreateAvatarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

export const CreateMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  name: z.string(),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});
