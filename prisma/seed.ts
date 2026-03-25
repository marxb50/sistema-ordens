import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminHash = await bcrypt.hash("selimparnamirim", 12);
  await prisma.usuario.upsert({
    where: { login: "admin@selim.com" },
    update: {
      senhaHash: adminHash,
      email: "admin@selim.com",
    },
    create: {
      nome: "Administrador",
      login: "admin@selim.com",
      email: "admin@selim.com",
      senhaHash: adminHash,
      tipo: "ADMIN",
      status: "ATIVO",
    },
  });

  // Create SELIM user
  const selimHash = await bcrypt.hash("prefeitura", 12);
  await prisma.usuario.upsert({
    where: { login: "selim" },
    update: {},
    create: {
      nome: "SELIM",
      login: "selim",
      email: "selim@cadastramento.tech",
      senhaHash: selimHash,
      tipo: "SELIM",
      status: "ATIVO",
    },
  });

  // Create MB user
  const mbHash = await bcrypt.hash("ordem", 12);
  await prisma.usuario.upsert({
    where: { login: "mb" },
    update: {},
    create: {
      nome: "MB Conferência",
      login: "mb",
      email: "mb@cadastramento.tech",
      senhaHash: mbHash,
      tipo: "MB",
      status: "ATIVO",
    },
  });

  // Create default config entries
  const configs = [
    { key: "ADMIN_DEFAULT_LOGIN", value: "admin" },
    { key: "SELIM_LOGIN", value: "selim" },
    { key: "MB_LOGIN", value: "mb" },
  ];

  for (const cfg of configs) {
    await prisma.config.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: cfg,
    });
  }

  console.log("✅ Seed completed!");
  console.log("   Admin: admin@selim.com / selimparnamirim");
  console.log("   SELIM: selim / prefeitura");
  console.log("   MB: mb / ordem");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
