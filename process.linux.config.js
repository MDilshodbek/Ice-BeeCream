const { watch } = require("fs-extra");

module.exports = {
  apps: [
    {
      name: "IceAdmin",
      cwd: "/home/iceCream-project/Ice-BeeCream",
      script: "dist/server.js",
      watch: false,
      interpreter: "node",

      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "cluster",
    },
  ],
};
