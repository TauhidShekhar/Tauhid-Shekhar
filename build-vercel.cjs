const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determine what to build based on Vercel Project Name
const projectName = process.env.VERCEL_PROJECT_NAME || '';
const isAdmin = projectName.toLowerCase().includes('admin');

console.log(`Vercel Project Name: ${projectName}`);
console.log(`Detected Target: ${isAdmin ? 'ADMIN' : 'FRONTEND'}`);

try {
  if (isAdmin) {
    console.log('Building Admin Panel...');
    execSync('npm run build --prefix admin', { stdio: 'inherit' });
    
    console.log('Copying admin/dist to root dist...');
    fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
    copyFolderSync(path.join(__dirname, 'admin', 'dist'), path.join(__dirname, 'dist'));
  } else {
    console.log('Building Frontend...');
    execSync('npm run build --prefix frontend', { stdio: 'inherit' });
    
    console.log('Copying frontend/dist to root dist...');
    fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
    copyFolderSync(path.join(__dirname, 'frontend', 'dist'), path.join(__dirname, 'dist'));
  }
  console.log('Build and routing completed successfully!');
} catch (error) {
  console.error('Build execution failed:', error);
  process.exit(1);
}

// Helper to recursively copy directories
function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}
