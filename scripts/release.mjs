import fs from "node:fs";
import https from "node:https";
import crypto from "node:crypto";

const versionArg = process.argv[2];

if (!versionArg) {
  console.error("Usage: release.ts [x.y.z]");
  process.exit(1);
}

const version = versionArg.replace(/[a-z-]*/gi, "");

console.log(`Releasing zag on Homebrew: v${version}`);

const url = `https://api.github.com/repos/Himenon/zag/releases/tags/v${version}`;

/**
 *
 * @param {string} url
 * @returns {Promise<{ assets: { name: string; browser_download_url: string; }[] }>}
 */
const fetchGitHubRelease = async (url) => {
  const res = await fetch(url);
  return res.json();
};

/**
 *
 * @param {string} url
 * @returns
 */
const fetchAsset = async (url) => {
  const res = await fetch(url);
  const value = await res.arrayBuffer();
  const data = Buffer.from(value);
  return { data, finalUrl: url };
};

async function main() {
  try {
    const release = await fetchGitHubRelease(url);
    console.log(`- Found release: ${release.name}`);
    console.log(`- Fetched Url: ${url}`);

    /**
     * @type Record<string, string>
     */
    const assets = {};

    const tasks = release.assets.map(async (asset) => {
      const filename = asset.name;
      if (!filename.endsWith(".zip") || filename.includes("-profile")) {
        console.log(`- Skipped asset: ${filename}`);
        return;
      }

      const { data } = await fetchAsset(asset.browser_download_url);
      const sha256 = crypto.createHash("sha256").update(data).digest("hex");

      console.log(`- Found asset: ${filename} [sha256: ${sha256}]`);
      assets[filename] = sha256;
    });

    await Promise.all(tasks);

    let formula = fs.readFileSync("Formula/zag.rb", "utf8");
    formula = formula
      .split("\n")
      .map((line) => {
        const query = line.trim();
        if (query.startsWith("version")) {
          return line.replace(/"[0-9.]+"/, `"${version}"`);
        }

        if (query.startsWith("sha256")) {
          const asset = query.split("#").at(1)?.trim();
          if (!asset || !assets[asset]) {
            throw new Error(`Did not find sha256: ${asset}`);
          }
          return line.replace(/"[A-Fa-f0-9]+"/, `"${assets[asset]}"`);
        }
        return line;
      })
      .join("\n");

    const versionedClass = `class zagAT${version.replace(/\./g, "")}`;
    const versionedFormula = formula.replace(/class Zag/, versionedClass);

    fs.writeFileSync(`Formula/zag@${version}.rb`, versionedFormula);
    console.log(`- Saved Formula/zag@${version}.rb`);

    fs.writeFileSync("Formula/zag.rb", formula);
    console.log("- Saved Formula/zag.rb");

    let readme = fs.readFileSync("README.md", "utf8");
    readme = readme.replace(/zag@[0-9]+\.[0-9]+\.[0-9]+/, `zag@${version}`);
    fs.writeFileSync("README.md", readme);
    console.log("- Update README.md");

    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

await main().then((error) => {
  process.exit(1);
});
