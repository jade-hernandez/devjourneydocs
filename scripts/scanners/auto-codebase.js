/* eslint-disable @typescript-eslint/no-var-requires */
import { createWriteStream, promises as fsp } from "fs";
import { join, extname, dirname } from "path";
import { createInterface } from "readline";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const defaultOutputFilePath = "./scripts/scanners/output/codebase.md";

// Directories to ignore by default
const defaultIgnoreDirs = [
  "cicd",
  "node_modules",
  "public",
  "build",
  "dist",
  "helm",
  "verdaccio",
  "types",
  "coverage"
];

// Files to ignore by default
const defaultIgnoreFiles = [
  ".DS_Store",
  ".env",
  ".gitignore",
  ".prettierrc",
  ".eslintrc.js",
  "yarn.lock",
  "package-lock.json",
  "tsconfig.json",
  "jest.config.js",
  "webpack.config.js",
  "babel.config.js",
  "verdaccio.yaml",
  "Dockerfile",
  "docker-compose.yml",
  "Jenkinsfile",
  "Makefile",
  "README.md"
];

// Function to recursively get all file paths based on specified conditions
async function getAllFiles(
  dir,
  includeExtensions = [],
  excludeExtensions = [],
  ignoreDirs = [],
  ignoreFiles = [],
  files = []
) {
  let items;
  try {
    items = await fsp.readdir(dir);
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
    return files;
  }

  for (const item of items) {
    const fullPath = join(dir, item);
    let stats;
    try {
      stats = await fsp.stat(fullPath);
    } catch (err) {
      console.error(`Error getting stats of ${fullPath}: ${err.message}`);
      continue;
    }

    if (stats.isDirectory() && !ignoreDirs.includes(item)) {
      await getAllFiles(
        fullPath,
        includeExtensions,
        excludeExtensions,
        ignoreDirs,
        ignoreFiles,
        files
      );
    } else if (stats.isFile() && !ignoreFiles.includes(item)) {
      const fileExt = extname(fullPath);
      const include =
        includeExtensions.length === 0 || includeExtensions.includes(fileExt);
      const exclude = excludeExtensions.includes(fileExt);
      if (include && !exclude) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

// Function to write file paths and their content to the output file
async function writeContentToFile(files, outputFilePath) {
  // Create the output directory if it doesn't exist
  const outputDir = dirname(outputFilePath);
  try {
    await fsp.mkdir(outputDir, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory ${outputDir}: ${err.message}`);
    return;
  }

  const outputStream = createWriteStream(outputFilePath, { flags: "w" });

  for (const file of files) {
    try {
      const content = await fsp.readFile(file, "utf8");
      outputStream.write(`## ${file}\n\`\`\`\n${content}\n\`\`\`\n\n`);
    } catch (err) {
      console.error(`Error reading file ${file}: ${err.message}`);
    }
  }

  outputStream.end(() => {
    console.log(
      `Content of the selected files has been written to ${outputFilePath}`
    );
  });
}

// Function to prompt user input
function promptUser() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(
    "Enter the directory to scan (default is current directory): ",
    inputDir => {
      rl.question(
        "Specify file types to include (comma-separated, e.g., .ts,.js) (default is all files): ",
        includeTypes => {
          rl.question(
            "Specify file types to exclude (comma-separated, e.g., .spec.ts) (default is none): ",
            excludeTypes => {
              rl.question(
                "Specify additional directories to ignore (comma-separated): ",
                additionalIgnoreDirs => {
                  rl.question(
                    "Specify additional files to ignore (comma-separated): ",
                    additionalIgnoreFiles => {
                      rl.question(
                        `Specify the output file path (default is ${defaultOutputFilePath}): `,
                        outputPath => {
                          const directoryToScan = inputDir || ".";
                          const includeExtensions = includeTypes
                            .split(",")
                            .map(ext => ext.trim())
                            .filter(ext => ext);
                          const excludeExtensions = excludeTypes
                            .split(",")
                            .map(ext => ext.trim())
                            .filter(ext => ext);
                          const ignoreDirs = defaultIgnoreDirs.concat(
                            additionalIgnoreDirs
                              .split(",")
                              .map(dir => dir.trim())
                              .filter(dir => dir)
                          );
                          const ignoreFiles = defaultIgnoreFiles.concat(
                            additionalIgnoreFiles
                              .split(",")
                              .map(file => file.trim())
                              .filter(file => file)
                          );
                          const outputFilePath =
                            outputPath || defaultOutputFilePath;

                          (async () => {
                            try {
                              const files = await getAllFiles(
                                directoryToScan,
                                includeExtensions,
                                excludeExtensions,
                                ignoreDirs,
                                ignoreFiles
                              );
                              await writeContentToFile(files, outputFilePath);
                            } catch (error) {
                              console.error(
                                `Error processing files: ${error.message}`
                              );
                            } finally {
                              rl.close();
                            }
                          })();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

// Parse command-line arguments
const argv = yargs(hideBin(process.argv)).argv;
const autoConfirm = argv.y;

if (autoConfirm) {
  // Use default values without prompts
  const directoryToScan = "./src";
  const includeExtensions = [];
  const excludeExtensions = [];
  const ignoreDirs = defaultIgnoreDirs;
  const ignoreFiles = defaultIgnoreFiles;
  const outputFilePath = defaultOutputFilePath;

  (async () => {
    try {
      const files = await getAllFiles(
        directoryToScan,
        includeExtensions,
        excludeExtensions,
        ignoreDirs,
        ignoreFiles
      );
      await writeContentToFile(files, outputFilePath);
    } catch (error) {
      console.error(`Error processing files: ${error.message}`);
    }
  })();
} else {
  promptUser();
}
