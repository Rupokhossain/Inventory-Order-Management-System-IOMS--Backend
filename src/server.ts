import app from "./app";
import config from "./app/config";

import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";

const PORT = config.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    if (!redisClient.isOpen) {
      await redisClient.connect().catch((err) => {
        console.warn(
          "⚠️ Initial Redis connection warning:",
          err?.message || err,
        );
      });
      console.log("Redis Connected Successfully.");
    }

    // await transporter.verify();
    // console.log("Nodemailer Connected Successfully.");

    // await seedSuperAdmin();
    // await seedTesterAdmin();
    // await seedTesterDoctor();

    // await deleteUnverifiedDoctors();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    process.on("unhandledRejection", (reason) => {
      console.warn("⚠️ Unhandled Rejection intercepted:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.warn("⚠️ Uncaught Exception intercepted:", error);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
