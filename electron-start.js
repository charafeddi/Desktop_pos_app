const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

// Build Electron preload first
const buildPreload = spawn('npm', ['run', 'build:preload'], {
  shell: true,
  stdio: 'inherit'
});

buildPreload.on('close', (code) => {
  if (code !== 0) {
    console.error('Preload build failed with code', code);
    process.exit(code);
  }

  // Start Vite dev server
  const vite = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'inherit'
  });

  // Wait for Vite to start
  setTimeout(() => {
    // Start Electron
    const electronProcess = spawn(electron, [path.join(__dirname, 'electron/main.js')], {
      stdio: 'inherit'
    });

    // Log startup errors clearly
    electronProcess.on('error', (err) => {
      console.error('Electron failed to start:', err);
    });

    // Keep Vite running; only log Electron exit code for debugging
    electronProcess.on('close', (code) => {
      console.log('Electron closed with code', code);
      // Keep Vite alive for debugging. Uncomment to restore previous behavior:
      // vite.kill();
      // process.exit(code);
    });
  }, 5000); // Give Vite 5 seconds to start
});