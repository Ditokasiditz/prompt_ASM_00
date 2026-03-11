/*
  Warnings:

  - You are about to drop the column `status` on the `Issue` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Issue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "impact" REAL,
    "factor" TEXT NOT NULL DEFAULT 'Network Security',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Issue" ("createdAt", "description", "factor", "id", "impact", "severity", "title", "updatedAt") SELECT "createdAt", "description", "factor", "id", "impact", "severity", "title", "updatedAt" FROM "Issue";
DROP TABLE "Issue";
ALTER TABLE "new_Issue" RENAME TO "Issue";
CREATE UNIQUE INDEX "Issue_title_key" ON "Issue"("title");
CREATE TABLE "new_IssueOnAsset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "issueId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "lastObserved" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,
    CONSTRAINT "IssueOnAsset_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IssueOnAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_IssueOnAsset" ("assetId", "comment", "id", "issueId", "lastObserved") SELECT "assetId", "comment", "id", "issueId", "lastObserved" FROM "IssueOnAsset";
DROP TABLE "IssueOnAsset";
ALTER TABLE "new_IssueOnAsset" RENAME TO "IssueOnAsset";
CREATE UNIQUE INDEX "IssueOnAsset_issueId_assetId_key" ON "IssueOnAsset"("issueId", "assetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
