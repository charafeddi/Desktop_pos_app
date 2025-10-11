const fs = require('fs');
const path = require('path');

// Fix asset paths in index.html for Electron
const indexPath = path.join(__dirname, 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/vite\.svg/g, 'href="./vite.svg');
  
  fs.writeFileSync(indexPath, content);
  console.log('✅ Fixed asset paths in index.html for Electron');
} else {
  console.log('❌ index.html not found');
}

// Fix asset paths in JavaScript files
const assetsDir = path.join(__dirname, 'dist', 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(assetsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace absolute asset paths with relative paths - more comprehensive
      content = content.replace(/\/assets\//g, './assets/');
      content = content.replace(/"\/assets\//g, '"./assets/');
      content = content.replace(/'\//g, "'./");
      content = content.replace(/\/assets\//g, './assets/');
      content = content.replace(/\/assets\//g, './assets/');
      
      // Fix specific patterns that might be causing issues
      content = content.replace(/preload CSS for \/assets\//g, 'preload CSS for ./assets/');
      content = content.replace(/Unable to preload CSS for \/assets\//g, 'Unable to preload CSS for ./assets/');
      
      // Fix any remaining absolute paths
      content = content.replace(/\/assets\//g, './assets/');
      
      fs.writeFileSync(filePath, content);
    }
  });
  
  console.log('✅ Fixed asset paths in JavaScript files for Electron');
}
