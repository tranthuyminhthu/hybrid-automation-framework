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
          const executedAt = startTime.toLocaleString("en-GB", {
            timeZone: "Asia/Ho_Chi_Minh",
          });

          const passed = report.stats.passes;
          const failed = report.stats.failures;
          const skipped = report.stats.pending;
          const total = report.stats.tests;
          const duration = (report.stats.duration / 1000).toFixed(2);

          const passRate = ((passed / total) * 100).toFixed(2);
          const failRate = ((failed / total) * 100).toFixed(2);

          const status =
            failed / total > 0.1
              ? "🔴 **Status: NOT GOOD**"
              : "🟢 **Status: GOOD**";

          const failedTestCases = report.results
            .flatMap((result) =>
              result.suites.flatMap((suite) =>
                suite.tests
                  .filter((t) => t.state === "failed")
                  .map(
                    (t) => `• ${t.fullTitle} – _${t.err.message || "No message"}_`
                  )
              )
            )
            .slice(0, 5)
            .join("\n") || "No failed test cases 🎉";

          const projectName = "Hybrid Automation Framework";
          const environment = config.env.ENVIRONMENT || "SIT";

          const message = {
            text: `📢 **Cypress Test Report** 📢

🏷️ **Project:** ${projectName}
🌐 **Environment:** ${environment}
🕒 **Executed At:** ${executedAt}
👤 **Executed by:** ${process.env.USER || "Automation Bot"}

📁 **Test Files:**
${testFiles.map((file, i) => `   ${i + 1}. ${file}`).join("\n")}

📊 **Test Summary:**
- ✅ **Passed:** ${passed} (${passRate}%)
- ❌ **Failed:** ${failed} (${failRate}%)
- ⚠️ **Skipped:** ${skipped}
- 🔢 **Total Tests:** ${total}
- ⏳ **Duration:** ${duration}s

📈 ${status}

🚨 **Failed Test Cases (Top 5):**
${failedTestCases}

🔗 **Full Report:** [Click to view report](https://hybrid-automation-framework.vercel.app)
`,
          };

          const response = await axios.post(TEAMS_WEBHOOK_URL, message);

          console.log("✅ Successfully sent report to MS Teams!", response.status);
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