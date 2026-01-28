CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_account_updated_at ON "Account";

CREATE TRIGGER update_account_updated_at
    BEFORE UPDATE ON "Account"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE "Account" 
ALTER COLUMN "updatedAt" 
SET DEFAULT CURRENT_TIMESTAMP;
