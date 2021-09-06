const { exec } = require('child_process');

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
} else {
  exec('npx husky install', (error, stdout, stderr) => {
    if (error) throw error;
    stdout && console.log(stdout);
    stderr && console.log(stderr);
  });
}
