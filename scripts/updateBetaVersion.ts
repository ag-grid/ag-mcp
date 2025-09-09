import packageJson from "../package.json";
import { parseVersion } from "./lib/parseVersion";
import fs from "fs";

function updateBetaVersion() {
  const packageJsonVersion = packageJson.version;
  const parsedVersion = parseVersion(packageJsonVersion);

  const d = new Date();
  const dateTag = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const timeTag = `${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
  const newBetaTag =
    `beta.${dateTag}.${timeTag}`;
  const newVersion = `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patchNum}-${newBetaTag}`;

  packageJson.version = newVersion;
  fs.writeFileSync(
    "package.json",
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8"
  );

  console.log(`Updated package.json version to ${newVersion}`);
}

updateBetaVersion();
