import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distIndexHtmlPath = path.resolve(__dirname, '../dist/index.html');

console.log('[Post-Build] Optimizing stylesheet loading in dist/index.html...');

try {
  if (!fs.existsSync(distIndexHtmlPath)) {
    console.error(`[Post-Build] Error: dist/index.html not found at ${distIndexHtmlPath}`);
    process.exit(1);
  }

  let htmlContent = fs.readFileSync(distIndexHtmlPath, 'utf8');

  // Match the standard Vite generated stylesheet link: <link rel="stylesheet" crossorigin href="/assets/index-[hash].css">
  const stylesheetRegex = /<link rel="stylesheet"\s+crossorigin\s+href="([^"]+)">/g;

  if (stylesheetRegex.test(htmlContent)) {
    // Reset regex index
    stylesheetRegex.lastIndex = 0;
    
    // Replace with non-render-blocking async link loader
    htmlContent = htmlContent.replace(
      stylesheetRegex,
      '<link rel="stylesheet" id="main-stylesheet" crossorigin href="$1" media="print" onload="this.media=\'all\';window.mainStylesheetLoaded=true">'
    );

    fs.writeFileSync(distIndexHtmlPath, htmlContent, 'utf8');
    console.log('[Post-Build] Successfully updated stylesheet tag to load asynchronously!');
  } else {
    console.warn('[Post-Build] Warning: No matching stylesheet link tags found in dist/index.html.');
  }
} catch (error) {
  console.error('[Post-Build] Exception occurred:', error);
  process.exit(1);
}
