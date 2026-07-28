import { PrismaClient } from ".prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ROLES
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  console.log("✅ Roles Seeded");

  // COUNTRIES
  const pakistan = await prisma.country.upsert({
    where: { code: "PK" },
    update: {},
    create: {
      name: "Pakistan",
      code: "PK",
    },
  });

  const uae = await prisma.country.upsert({
    where: { code: "AE" },
    update: {},
    create: {
      name: "United Arab Emirates",
      code: "AE",
    },
  });

  console.log("✅ Countries Seeded");
// CURRENCIES
await prisma.currency.upsert({
  where: { code: "USD" },
  update: {},
  create: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
  },
});

await prisma.currency.upsert({
  where: { code: "PKR" },
  update: {},
  create: {
    code: "PKR",
    name: "Pakistani Rupee",
    symbol: "Rs",
  },
});

await prisma.currency.upsert({
  where: { code: "AED" },
  update: {},
  create: {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
  },
});

console.log("✅ Currencies Seeded");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });