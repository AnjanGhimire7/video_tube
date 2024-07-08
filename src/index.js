import connectDB from "./database/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import cluster from "node:cluster";
import os from "node:os";
const totalCpu = os.cpus().length;

dotenv.config({
  path: "./.env",
});
if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} running!!!`);
  //building workers
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }

  //suppose when some workers died by any resons it will create next workers
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  connectDB()
    .then(() => {
      app.listen(process.env.PORT || 5000, () => {
        console.log(`server is running on the port:${process.env.PORT}`);
      });
    })
    .catch((error) => {
      console.log("Mongodb connection failed!!!", error);
    }),
    console.log(`Worker process ${process.pid} running!!!`);
}
