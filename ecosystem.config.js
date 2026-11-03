// PM2 config for the server. Runs as user "deploy".
// "current" is a symlink to the active release, so reloads pick up new code.
module.exports = {
  apps: [
    {
      name: "ice-backend",
      cwd: "/home/deploy/ice/backend/current",
      script: "dist/server.js",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      max_memory_restart: "200M",
      node_args: "--max-old-space-size=160",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
