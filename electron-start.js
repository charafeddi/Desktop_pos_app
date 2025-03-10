const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit'
});

// Wait for Vite to start
setTimeout(() => {
  // Start Electron with the .js file instead of .ts
  const electronProcess = spawn(electron, [path.join(__dirname, 'electron/main.js')], {
    stdio: 'inherit'
  });

  electronProcess.on('close', () => {
    vite.kill();
    process.exit();
  });
}, 5000); // Give Vite 5 seconds to start 