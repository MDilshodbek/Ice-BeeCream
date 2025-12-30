// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "ICECREAM",
      cwd: "./",
      script: "./dist/server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        REACT_APP_API_URL: "http://localhost:3003",
      },
      instances: 1,
      exec_mode: "cluster" 
    },
  ],
};
