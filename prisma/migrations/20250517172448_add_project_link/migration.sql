/*
  Warnings:

  - You are about to alter the column `price` on the `Apartment` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `projectLink` to the `Apartment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Apartment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" INTEGER NOT NULL,
    "sqMeters" REAL NOT NULL,
    "plan" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "roomsCount" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "projectLink" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Apartment" ("createdAt", "floor", "id", "imageUrl", "link", "plan", "price", "projectName", "roomsCount", "sqMeters", "status", "tag", "updatedAt") SELECT "createdAt", "floor", "id", "imageUrl", "link", "plan", "price", "projectName", "roomsCount", "sqMeters", "status", "tag", "updatedAt" FROM "Apartment";
DROP TABLE "Apartment";
ALTER TABLE "new_Apartment" RENAME TO "Apartment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
