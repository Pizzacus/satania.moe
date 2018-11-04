exports.files = {
  javascripts: {
    joinTo: {
      'app.js': /^app/,
      'vendor.js': /^(?!app)/
    }
  },
  stylesheets: {joinTo: 'app.css'}
};

exports.plugins = {
  babel: {presets: ['@babel/env']}
};

exports.modules = {
  autoRequire: {
    'app.js': ['babel-polyfill']
  }
}

exports.watcher = {
  usePolling: true,
  awaitWriteFinish: true
}
