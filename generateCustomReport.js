const fs = require("fs");

const jsonFilePath = "cypress/reports/mochawesome.json"; // Điều chỉnh tên file nếu cần
const outputFile = "cypress/custom-report/index.html"; // Lưu trong cypress/reports

const jsonReport = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

const stats = jsonReport.stats;
const suite = jsonReport.results[0].suites[0];
const tests = suite.tests;

const projectName = "Orange HRM Project";
const environment = "SIT";

const failToPassRatio =
  stats.passes > 0 ? (stats.failures / stats.passes) * 100 : 0;
const overallStatus = failToPassRatio > 10 ? "Not Good" : "Good";

let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DAILY STATUS REPORT</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f9f9f9; }
    h1 { color: #2c3e50; text-align: center; }
    .header-info { margin-bottom: 20px; }
    .header-info p { margin: 5px 0; font-size: 1.1em; }
    .summary, .suite { margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
    th { background: #3498db; color: white; }
    tr:nth-child(even) { background: #f2f2f2; }
    .pass { color: #27ae60; font-weight: bold; }
    .fail { color: #c0392b; font-weight: bold; }
    .status-good { color: #27ae60; }
    .status-not-good { color: #c0392b; }
  </style>
</head>
<body>
  <h1>Daily Status Report</h1>

  <!-- Project Name and Environment -->
  <div class="header-info">
    <p><strong>Project Name:</strong> ${projectName}</p>
    <p><strong>Environment:</strong> ${environment}</p>
  </div>

  <!-- Summary -->
  <div class="summary">
    <h2>Summary</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Tests</td><td>${stats.tests}</td></tr>
      <tr><td>Passes</td><td>${stats.passes}</td></tr>
      <tr><td>Failures</td><td>${stats.failures}</td></tr>
      <tr><td>Pending</td><td>${stats.pending}</td></tr>
      <tr><td>Duration</td><td>${stats.duration / 1000} seconds</td></tr>
      <tr><td>Start Time</td><td>${stats.start}</td></tr>
      <tr><td>End Time</td><td>${stats.end}</td></tr>
      <tr><td>Pass Percentage</td><td>${stats.passPercent}%</td></tr>
      <tr><td>Overall Status</td><td><span class="${
        overallStatus === "Good" ? "status-good" : "status-not-good"
      }">${overallStatus}</span></td></tr>
    </table>
  </div>

  <!-- Suite and Tests -->
  <div class="suite">
    <h2>Suite: ${suite.title}</h2>
    <p><strong>File:</strong> ${jsonReport.results[0].file}</p>
    <p><strong>Total Duration:</strong> ${suite.duration / 1000} seconds</p>
    <table>
      <thead>
        <tr>
          <th>Test Title</th>
          <th>Status</th>
          <th>Duration (ms)</th>
          <th>Error (if any)</th>
        </tr>
      </thead>
      <tbody>
`;

tests.forEach((test) => {
  htmlContent += `
        <tr>
          <td>${test.title}</td>
          <td><span class="${test.state === "passed" ? "pass" : "fail"}">${
    test.state
  }</span></td>
          <td>${test.duration}</td>
          <td>${test.err.message ? test.err.message : "N/A"}</td>
        </tr>
  `;
});

htmlContent += `
      </tbody>
    </table>
  </div>
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlContent, "utf8");
console.log(`Custom HTML report generated at ${outputFile}`);
