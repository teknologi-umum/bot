const { exec } = require("child_process");
const process = require("process");

if (process.env.NODE_ENV === "production") {
  process.exit(0);
} else {
  exec("npx husky install", (error, stdout, stderr) => {
    if (error) throw error;
    stdout && process.stdout.write(stdout + "\n");
    stderr && process.stderr.write(stderr + "\n");
  });
}
