-- cspell:word datasource autoincrement eedea ffaf fcec eccb dfde srid srtext dbgenerated watermarkposition 
-- CreateEnum
CREATE TYPE "photos_type_enum" AS ENUM ('ORIGINAL', 'LOGO', 'FAVICON');

-- CreateEnum
CREATE TYPE "sites_watermarkposition_enum" AS ENUM (
    'TOP_LEFT',
    'TOP_RIGHT',
    'BOTTOM_LEFT',
    'BOTTOM_RIGHT'
);

-- CreateTable
CREATE TABLE "gps_markers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(6) NOT NULL,
    "coordinate" geography NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "city" VARCHAR NOT NULL,
    "ownerId" UUID NOT NULL,
    CONSTRAINT "PK_c244f86d053d66d22ed6d19f7cd" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,
    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "thumbnailURL" VARCHAR NOT NULL,
    "type" "photos_type_enum" NOT NULL,
    "width" INTEGER NOT NULL,
    "ownerId" UUID NOT NULL,
    CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR,
    "updated" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR,
    "photoId" UUID,
    "ownerId" UUID NOT NULL,
    CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "description" VARCHAR,
    "name" VARCHAR,
    "title" VARCHAR,
    "imdb" VARCHAR,
    "twitter" VARCHAR,
    "linkedIn" VARCHAR,
    "instagram" VARCHAR,
    "github" VARCHAR,
    "facebook" VARCHAR,
    "ownerId" UUID NOT NULL,
    "domain" TEXT,
    "logoId" UUID,
    "watermarkPosition" "sites_watermarkposition_enum",
    CONSTRAINT "PK_4f5eccb1dfde10c9170502595a7" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites_favicons_photos" (
    "sitesId" UUID NOT NULL,
    "photosId" UUID NOT NULL,
    CONSTRAINT "PK_0c1914a234ab0a8474933f67af3" PRIMARY KEY ("sitesId", "photosId")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "githubId" INTEGER,
    "username" VARCHAR NOT NULL,
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "REL_c0e6e8c4bd59e6e015fe7cb307" ON "posts"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_b00408635dde2a3b0cb6e57de17" ON "sites"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_4578b679503e1b86cc1c2531b9" ON "sites"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_30a2845f272f4b824a171ecd3be" ON "sites"("logoId");

-- CreateIndex
CREATE INDEX "IDX_644cbd25b5502c11c9a4f4c37a" ON "sites_favicons_photos"("sitesId");

-- CreateIndex
CREATE INDEX "IDX_9266cd2ed6671dd63050807ddc" ON "sites_favicons_photos"("photosId");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_42148de213279d66bf94b363bf" ON "users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users"("username");

-- AddForeignKey
ALTER TABLE
    "gps_markers"
ADD
    CONSTRAINT "FK_7cce4c3c533871d1a20010213be" FOREIGN KEY ("ownerId") REFERENCES "sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "photos"
ADD
    CONSTRAINT "FK_556eedea27ffaf50a4ee0c0a058" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "posts"
ADD
    CONSTRAINT "FK_0e33434a2d18c89a149c8ad6d86" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "posts"
ADD
    CONSTRAINT "FK_c0e6e8c4bd59e6e015fe7cb307e" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "sites"
ADD
    CONSTRAINT "FK_30a2845f272f4b824a171ecd3be" FOREIGN KEY ("logoId") REFERENCES "photos"("id") ON DELETE
SET
    NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "sites"
ADD
    CONSTRAINT "FK_b00408635dde2a3b0cb6e57de17" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "sites_favicons_photos"
ADD
    CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4" FOREIGN KEY ("sitesId") REFERENCES "sites"("id") ON DELETE
SET
    NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "sites_favicons_photos"
ADD
    CONSTRAINT "FK_9266cd2ed6671dd63050807ddc8" FOREIGN KEY ("photosId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;