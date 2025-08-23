/*
  Warnings:

  - You are about to drop the column `average` on the `Insight` table. All the data in the column will be lost.
  - You are about to drop the column `net` on the `Insight` table. All the data in the column will be lost.
  - Added the required column `averageIncome` to the `Insight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netIncome` to the `Insight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Insight` DROP COLUMN `average`,
    DROP COLUMN `net`,
    ADD COLUMN `averageIncome` INTEGER NOT NULL,
    ADD COLUMN `netIncome` INTEGER NOT NULL,
    MODIFY `spendBuckets` INTEGER NULL,
    MODIFY `riskFlags` INTEGER NULL;
