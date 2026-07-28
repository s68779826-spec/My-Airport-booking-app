-- CreateTable
CREATE TABLE "customers_notes" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "customers_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_customers_notes" (
    "serviceId" INTEGER NOT NULL,
    "airportId" INTEGER NOT NULL,
    "customerNoteId" INTEGER NOT NULL,

    CONSTRAINT "service_customers_notes_pkey" PRIMARY KEY ("serviceId","airportId","customerNoteId")
);

-- CreateTable
CREATE TABLE "passengers_customers_notes" (
    "passengerId" INTEGER NOT NULL,
    "airportId" INTEGER NOT NULL,
    "customerNoteId" INTEGER NOT NULL,

    CONSTRAINT "passengers_customers_notes_pkey" PRIMARY KEY ("passengerId","airportId","customerNoteId")
);

-- CreateTable
CREATE TABLE "airport_customers_notes" (
    "airportId" INTEGER NOT NULL,
    "customerNoteId" INTEGER NOT NULL,

    CONSTRAINT "airport_customers_notes_pkey" PRIMARY KEY ("airportId","customerNoteId")
);

-- CreateIndex
CREATE INDEX "service_customers_notes_serviceId_idx" ON "service_customers_notes"("serviceId");

-- CreateIndex
CREATE INDEX "service_customers_notes_airportId_idx" ON "service_customers_notes"("airportId");

-- CreateIndex
CREATE INDEX "service_customers_notes_customerNoteId_idx" ON "service_customers_notes"("customerNoteId");

-- CreateIndex
CREATE INDEX "passengers_customers_notes_passengerId_idx" ON "passengers_customers_notes"("passengerId");

-- CreateIndex
CREATE INDEX "passengers_customers_notes_airportId_idx" ON "passengers_customers_notes"("airportId");

-- CreateIndex
CREATE INDEX "passengers_customers_notes_customerNoteId_idx" ON "passengers_customers_notes"("customerNoteId");

-- CreateIndex
CREATE INDEX "airport_customers_notes_airportId_idx" ON "airport_customers_notes"("airportId");

-- CreateIndex
CREATE INDEX "airport_customers_notes_customerNoteId_idx" ON "airport_customers_notes"("customerNoteId");

-- AddForeignKey
ALTER TABLE "service_customers_notes" ADD CONSTRAINT "service_customers_notes_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_customers_notes" ADD CONSTRAINT "service_customers_notes_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_customers_notes" ADD CONSTRAINT "service_customers_notes_customerNoteId_fkey" FOREIGN KEY ("customerNoteId") REFERENCES "customers_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers_customers_notes" ADD CONSTRAINT "passengers_customers_notes_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "passengers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers_customers_notes" ADD CONSTRAINT "passengers_customers_notes_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers_customers_notes" ADD CONSTRAINT "passengers_customers_notes_customerNoteId_fkey" FOREIGN KEY ("customerNoteId") REFERENCES "customers_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airport_customers_notes" ADD CONSTRAINT "airport_customers_notes_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airport_customers_notes" ADD CONSTRAINT "airport_customers_notes_customerNoteId_fkey" FOREIGN KEY ("customerNoteId") REFERENCES "customers_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
