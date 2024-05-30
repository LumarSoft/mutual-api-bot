module.exports = {
  apps: [
    {
      name: "mutual-api-bot",
      script: "./dist/app.js",
      cron_restart: "0 */2 * * *",
    },
  ],
};
