const { Piscina } = require("piscina");
const path = require("path");

const workerPath = path.resolve(__dirname, "../workers/sendNewsWorker.js");

const emailWorker = new Piscina({
  filename: workerPath,
  minThreads: 1,
  maxThreads: 4,
  idleTimeout: 10000,
});

module.exports = emailWorker;
