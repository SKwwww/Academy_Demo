module.exports = {
  apps : [{
    name: "index",
    script: 'index.js',
    watch: '.'
  }
         ],

  deploy : {
    production : {
      user : 'root',
      host : '127.0.0.1',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : '********',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

