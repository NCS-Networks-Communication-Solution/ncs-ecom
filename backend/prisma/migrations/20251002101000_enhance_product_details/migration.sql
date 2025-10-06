ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "description_en" TEXT,
    ADD COLUMN IF NOT EXISTS "description_th" TEXT,
    ADD COLUMN IF NOT EXISTS "specifications" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "products"
SET "description_en" = COALESCE("description_en", "description"),
    "description_th" = COALESCE("description_th", "description");
