/*
  Warnings:

  - You are about to drop the column `spaceId` on the `Element` table. All the data in the column will be lost.
  - Added the required column `static` to the `Element` table without a default value. This is not possible if the table is not empty.
  - Made the column `height` on table `Space` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Element" DROP COLUMN "spaceId",
ADD COLUMN     "static" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "height" SET NOT NULL;
