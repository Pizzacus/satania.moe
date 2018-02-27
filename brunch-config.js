exports.files = {
  javascripts: {
    joinTo: {
      'app.js': "app/*.js"
    }
  },
  stylesheets: {joinTo: 'app.css'}
};

exports.plugins = {
  babel: {presets: ['latest']}
};
