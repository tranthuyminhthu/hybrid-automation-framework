const dotenv = require("dotenv");
const { defineConfig } = require("cypress");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin =
  require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin =
  require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;

dotenv.config();
const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL;

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/test-cases/cucumber/feature/**/*.feature",

    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      on("after:run", async () => {
        console.log("🔥 after:run successfully!");

        const reportPath = path.join(
          process.cwd(),
          "cypress/reports/mochawesome.json"
        );

        if (!fs.existsSync(reportPath)) {
          console.error("❌ Can't find report:", reportPath);
          return;
        }

        try {
          const data = fs.readFileSync(reportPath, "utf8");
          const report = JSON.parse(data);
          const testFiles = [
            ...new Set(report.results.map((test) => test.file)),
          ];
          const startTime = new Date(report.stats.start);
          const formattedTime = startTime.toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          });

          const message = {
            text: `📢 Cypress Test Report 📢\n
            📂 Test Files:\n📂 ${testFiles.join("\n")}\n
            ⏰ Execution time: ${formattedTime}\n
            ✅ Passed: ${report.stats.passes}\n
            ❌ Failed: ${report.stats.failures}\n
            🔢 Total: ${report.stats.tests}\n
            ⏳ Duration: ${(report.stats.duration / 1000).toFixed(2)}s`,
          };

          const response = await axios.post(TEAMS_WEBHOOK_URL, message);

          console.log("✅ Success send report to MS Teams!", response.status);
        } catch (err) {
          console.error(
            "❌ Failed to send report to MS Teams:",
            err.response?.status,
            err.message
          );
        }
      });

      return config;
    },
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/reports",
      overwrite: true,
      html: true,
      json: true,
    },
  },
})