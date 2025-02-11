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

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then((res) => {
      res.json().then((data) => {
        resolve(data);
      });
    });
  });
}

function fetchAsset(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Node.js" } }, (res) => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        return resolve(fetchAsset(res.headers.location));
      }
      if (res.statusCode !== 200) {
        reject(`Did not find asset: [status: ${res.statusCode}]`);
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () =>
        resolve({ data: Buffer.concat(chunks), finalUrl: url })
      );
    });
  });
}

async function main() {
  try {
    const release = await fetchJson(url);
    console.log(`Found release: ${release.name}`);
    console.log(`Fetched Url: ${url}`);

    const assets = {};

    for (const asset of release.assets) {
      const filename = asset.name;
      if (!filename.endsWith(".zip") || filename.includes("-profile")) {
        console.log(`Skipped asset: ${filename}`);
        continue;
      }

      const { data } = await fetchAsset(asset.browser_download_url);
      const sha256 = crypto.createHash("sha256").update(data).digest("hex");

      console.log(`Found asset: ${filename} [sha256: ${sha256}]`);
      assets[filename] = sha256;
    }

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
    const versionedFormula = formula.replace(/class zag/, versionedClass);
    fs.writeFileSync(`Formula/zag@${version}.rb`, versionedFormula);
    console.log(`Saved Formula/zag@${version}.rb`);

    fs.writeFileSync("Formula/zag.rb", formula);
    console.log("Saved Formula/zag.rb");

    let readme = fs.readFileSync("README.md", "utf8");
    readme = readme.replace(/zag@[0-9]+\.[0-9]+\.[0-9]+/, `zag@${version}`);
    fs.writeFileSync("README.md", readme);
    console.log("Saved README.md");

    console.log("Done");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
