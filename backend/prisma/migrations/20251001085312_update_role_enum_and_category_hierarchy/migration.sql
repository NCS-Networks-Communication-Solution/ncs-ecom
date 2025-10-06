-- Add hierarchy metadata to categories
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "parent_id" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'categories_parent_id_fkey'
  ) THEN
    ALTER TABLE "categories"
    ADD CONSTRAINT "categories_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "categories"("parent_id");

-- Align Role enum with published contract
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('ADMIN', 'PURCHASER', 'VIEWER', 'SALES');

ALTER TABLE "users"
ALTER COLUMN "role" TYPE "Role"
USING (
  CASE "role"::text
    WHEN 'USER' THEN 'PURCHASER'
    WHEN 'APPROVER' THEN 'SALES'
    ELSE "role"::text
  END
)::"Role";

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PURCHASER';

DROP TYPE "Role_old";
