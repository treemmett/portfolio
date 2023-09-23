ALTER TABLE
  "gps_markers"
ADD
  COLUMN "latitude" DOUBLE PRECISION,
ADD
  COLUMN "longitude" DOUBLE PRECISION;

UPDATE
  "gps_markers"
SET
  "latitude" = ST_Y(coordinate :: geometry),
  "longitude" = ST_X(coordinate :: geometry);

ALTER TABLE
  "gps_markers"
ALTER COLUMN
  "latitude"
SET
  NOT NULL,
ALTER COLUMN
  "longitude"
SET
  NOT NULL;

ALTER TABLE
  "gps_markers" DROP COLUMN "coordinate";

-- cspell:word postgis
DROP EXTENSION IF EXISTS Postgis;

-- DropTable
DROP TABLE "migrations";