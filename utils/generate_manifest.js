const fileSystem = require("fs");
const path = require("path");
const manifest = require("../src/manifest.json");
const parseArgs = require("minimist");

// generates the manifest file using the package.json informations
manifest.description = process.env.npm_package_description;
manifest.version = process.env.extension_version || process.env.npm_package_version;

const args = parseArgs(process.argv.slice(2));
if (args.match) {
	manifest.permissions[0] = args.match;
	manifest.content_scripts[0].matches[0] = args.match;
}

fileSystem.writeFileSync(
	path.join(__dirname, "../build/manifest.json"),
	JSON.stringify(manifest),
);
