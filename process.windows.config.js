module.exports = {
  apps: [
    {
      name: "IceAdmin",
      cwd: __dirname,
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
