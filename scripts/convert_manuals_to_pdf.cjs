const fs = require('fs');
const path = require('path');

// Check if md-to-pdf is installed
let mdToPdf;
try {
    mdToPdf = require('md-to-pdf').mdToPdf;
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: The "md-to-pdf" package is required but not installed.');
    console.log('Please run the following command to install it:');
    console.log('\x1b[36m%s\x1b[0m', 'npm install md-to-pdf --no-save');
    process.exit(1);
}

const manualesDir = path.join(__dirname, '../manuales');
const outputDir = path.join(manualesDir, 'pdf');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

async function convertManuals() {
    try {
        const files = fs.readdirSync(manualesDir);
        const mdFiles = files.filter(file => file.endsWith('.md'));

        console.log(`Found ${mdFiles.length} Markdown files to convert...`);

        for (const file of mdFiles) {
            const inputPath = path.join(manualesDir, file);
            const outputPath = path.join(outputDir, file.replace('.md', '.pdf'));

            console.log(`Converting ${file} -> ${path.basename(outputPath)}...`);

            const pdf = await mdToPdf(
                { path: inputPath },
                {
                    dest: outputPath,
                    pdf_options: {
                        format: 'A4',
                        margin: '20mm',
                        printBackground: true,
                    },
                    stylesheet_encoding: 'utf-8',
                    css: `
                        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; }
                        h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
                        h2 { color: #1e40af; margin-top: 2em; }
                        h3 { color: #1e3a8a; }
                        code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
                        pre { background-color: #f3f4f6; padding: 1em; border-radius: 5px; overflow-x: auto; }
                        blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; color: #4b5563; }
                    `
                }
            );
        }

        console.log('\x1b[32m%s\x1b[0m', 'All manuals converted successfully!');
        console.log(`PDFs are located in: ${outputDir}`);

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Conversion failed:', error);
    }
}

convertManuals();
