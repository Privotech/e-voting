const express = require('express');
const router = express.Router();
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

function addDirectoryToZip(zip, dirPath, zipFolderPath = '') {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.next' || item === '.cache') continue;
    const fullPath = path.join(dirPath, item);
    const relativeZipPath = zipFolderPath ? `${zipFolderPath}/${item}` : item;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addDirectoryToZip(zip, fullPath, relativeZipPath);
    } else {
      const fileData = fs.readFileSync(fullPath);
      zip.file(relativeZipPath, fileData);
    }
  }
}

// Download Next.js folder as a runnable ZIP package
router.get('/nextjs', async (req, res) => {
  try {
    const zip = new JSZip();
    const nextjsPath = path.resolve(__dirname, '../../nextjs-app');
    
    if (fs.existsSync(nextjsPath)) {
      addDirectoryToZip(zip, nextjsPath);
    } else {
      // Fallback: zip the root directory
      const rootPath = path.resolve(__dirname, '../../');
      addDirectoryToZip(zip, rootPath);
    }

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="e-voting-nextjs-app.zip"');
    res.send(content);
  } catch (err) {
    console.error('Export Next.js ZIP error:', err);
    res.status(500).json({ error: 'Failed to generate Next.js package ZIP' });
  }
});

// Download full project as ZIP
router.get('/project', async (req, res) => {
  try {
    const zip = new JSZip();
    const projectRoot = path.resolve(__dirname, '../../');
    addDirectoryToZip(zip, projectRoot);

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="e-voting-full-project.zip"');
    res.send(content);
  } catch (err) {
    console.error('Export project ZIP error:', err);
    res.status(500).json({ error: 'Failed to generate project ZIP' });
  }
});

module.exports = router;
