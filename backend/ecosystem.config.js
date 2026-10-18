module.exports = {
  apps: [
    {
      name: "tauhid-backend",
      script: "server.js",
      cwd: __dirname,
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      },
      error_file: "logs/pm2-err.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
      time: true
    }
  ]
};
