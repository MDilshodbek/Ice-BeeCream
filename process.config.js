module.exports = {
  apps: [
    {
      name: "IceBeeCream",
      cwd: "./",
      script: "./dist/server.js",
      watch: false,
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      instance: 1,
      exec_mode: "cluster",
    },
  ],
};
