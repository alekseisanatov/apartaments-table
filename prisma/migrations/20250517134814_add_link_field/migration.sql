-- CreateTable
CREATE TABLE "Apartment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" REAL NOT NULL,
    "sqMeters" REAL NOT NULL,
    "plan" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "roomsCount" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "status" STRING NOT NULL,
    "tag" STRING NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
