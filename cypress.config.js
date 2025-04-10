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

          // Test Summary Data
          const passed = report.stats.passes;
          const failed = report.stats.failures;
          const skipped = report.stats.skipped;
          const total = report.stats.tests;
          const duration = (report.stats.duration / 1000).toFixed(2);

          const passRate = ((passed / total) * 100).toFixed(2);
          const failRate = ((failed / total) * 100).toFixed(2);

          const status =
            failRate > 10
              ? "🚨 **Overall Status: NOT GOOD**"
              : "✅ **Overall Status: GOOD**";

          // Failed Test Cases
          const failedTestCases =
            report.results
              .flatMap((result) =>
                result.suites.flatMap((suite) =>
                  suite.tests
                    .filter((test) => test.state === "failed")
                    .map((test) => {
                      const errorMessage = test.err.message || "No message";
                      const firstSentence = errorMessage.split(".")[0];
                      return `• ${test.fullTitle} – _${firstSentence}_`;
                    })
                )
              )
              .join("\n") || "No failed test cases";

          // Test Suites
          const testSuites =
            report.results
              .flatMap((result) => result.suites.map((suite) => suite.title))
              .filter((title) => title) // Loại bỏ title rỗng
              .map((title, index) => `   ${index + 1}. ${title}`)
              .join("\n") || "No test suites found";

          // Message
          const message = {
            text:
              `**[DAILY STATUS REPORT]${
                process.env.PROJECT_NAME || "Orange HRM Project"
              } at ${
                process.env.ENVIRONMENT || "SIT"
              } on ${formattedTime} [Click to view detail](https://hybrid-automation-framework.vercel.app)**\n\n` +
              `${status}\n\n` +
              `📁 **Test Suites:**\n\n` +
              `${testSuites}\n\n` +
              `📊 **Test Summary:**\n` +
              `- **Passed:** ${passed} (${passRate}%)\n` +
              `- **Failed:** ${failed} (${failRate}%)\n` +
              `- **Skipped:** ${skipped}\n` +
              `- **Total Tests:** ${total}\n` +
              `- **Duration:** ${duration}s\n\n` +
              `🚨 **Failed Test Cases:**\n\n` +
              `${failedTestCases}\n\n`,
          };

          // Send to Microsoft Teams
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
});
