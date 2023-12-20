module.exports = {
  apps: [
    {
      script: "./server.js",
      watch: ".",
      instances: "max",
    },
    {
      script: "./service-worker/",
      watch: ["./service-worker"],
    },
  ],

  deploy: {
    production: {
      user: "ec2-user",
      host: "3.14.147.81",
      ref: "origin/master",
      repo: "git@github.com:aymanmj/blog-project.git",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
