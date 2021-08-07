import { exec } from 'child_process';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
} else {
  exec('husky install');
}