module.exports = {
    apps: [
        {
            name: "apiwsp",
            script: "./dist/app.js",
            cron_restart: "0 */6 * * *"
        }
    ]
}
