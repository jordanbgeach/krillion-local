#!/usr/bin/env node
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { build } from "vite";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(projectRoot, "dist-hostinger");
const archive = path.join(projectRoot, "outputs", "krillion-hostinger.zip");
const base = "/krillion/";

await build({
  root: projectRoot,
  configFile: path.join(projectRoot, "vite.local.config.ts"),
  mode: "hostinger",
});

// Only public PHP source and generated factual prompt metadata are packaged.
// Secrets and the writable cache live outside public_html and are never copied.
for (const filename of ["api.php", "api-lib.php"]) {
  await copyFile(
    path.join(projectRoot, "server", filename),
    path.join(output, filename),
  );
}
const { builtInPrompts } = await import(
  new URL("../lib/data/index.ts", import.meta.url).href
);
const promptBank = Object.fromEntries(
  builtInPrompts.map((prompt) => [prompt.id, prompt]),
);
await writeFile(
  path.join(output, "prompt-bank.json"),
  JSON.stringify(promptBank),
);

// Apache/LiteSpeed redirects a physical directory's slashless URL before
// loading index.html. Keep this configuration inside the krillion directory.
await writeFile(
  path.join(output, ".htaccess"),
  `DirectoryIndex index.html
<IfModule mod_dir.c>
  DirectorySlash On
</IfModule>
<IfModule mod_headers.c>
  <FilesMatch "^index\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`,
);

async function filesIn(directory, prefix = "") {
  const names = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix + entry.name;
    if (entry.isDirectory())
      names.push(
        ...(await filesIn(path.join(directory, entry.name), relative + "/")),
      );
    else if (entry.isFile()) names.push(relative);
    else throw new Error(`Unexpected non-file in static build: ${relative}`);
  }
  return names;
}

const files = await filesIn(output);
for (const required of [
  "index.html",
  "favicon.svg",
  "fonts/Silkscreen-Regular.ttf",
  "fonts/OFL.txt",
  ".htaccess",
  "api.php",
  "api-lib.php",
  "prompt-bank.json",
  "dictionary/words.json",
  "dictionary/SCOWL-LICENSE.txt",
]) {
  if (!files.includes(required))
    throw new Error(`Static build is missing ${required}.`);
}

// Verify the generated HTML and font references resolve inside /krillion/;
// catching an accidental root-relative URL here prevents a broken live upload.
for (const name of files.filter(
  (name) => name === "index.html" || name.endsWith(".css"),
)) {
  const source = await readFile(path.join(output, name), "utf8");
  const references = name.endsWith(".css")
    ? [...source.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)].map(
        (match) => match[1],
      )
    : [...source.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(
        (match) => match[1],
      );
  for (const reference of references) {
    if (/^(data:|https?:|#)/.test(reference)) continue;
    if (!reference.startsWith(base))
      throw new Error(
        `${name} contains an asset outside ${base}: ${reference}`,
      );
    const relative = decodeURIComponent(
      new URL(reference, "https://example.invalid").pathname.slice(base.length),
    );
    if (!files.includes(relative))
      throw new Error(`${name} refers to a missing file: ${reference}`);
  }
}

// A small standards-compliant ZIP writer avoids depending on a platform's zip
// executable or Python installation when creating the upload package.
const crcTable = Array.from({ length: 256 }, (_, value) => {
  for (let i = 0; i < 8; i++)
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes)
    value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

const localParts = [];
const directoryParts = [];
let offset = 0;
for (const name of files) {
  const filename = Buffer.from(name, "utf8");
  const bytes = await readFile(path.join(output, name));
  const compressed = deflateRawSync(bytes, { level: 9 });
  const checksum = crc32(bytes);
  const modified = (await stat(path.join(output, name))).mtime;
  const year = Math.max(1980, Math.min(2107, modified.getFullYear()));
  const dosDate =
    ((year - 1980) << 9) |
    ((modified.getMonth() + 1) << 5) |
    modified.getDate();
  const dosTime =
    (modified.getHours() << 11) |
    (modified.getMinutes() << 5) |
    Math.floor(modified.getSeconds() / 2);
  if (
    bytes.length >= 0xffffffff ||
    compressed.length >= 0xffffffff ||
    offset >= 0xffffffff
  )
    throw new Error("Upload package exceeds ZIP32 limits.");
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(dosTime, 10);
  local.writeUInt16LE(dosDate, 12);
  local.writeUInt32LE(checksum, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(bytes.length, 22);
  local.writeUInt16LE(filename.length, 26);
  localParts.push(local, filename, compressed);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  local.copy(central, 8, 6, 28);
  central.writeUInt32LE(offset, 42);
  directoryParts.push(central, filename);
  offset += local.length + filename.length + compressed.length;
}
const directory = Buffer.concat(directoryParts);
if (files.length >= 65535 || offset + directory.length >= 0xffffffff)
  throw new Error("Upload package exceeds ZIP32 limits.");
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
await mkdir(path.dirname(archive), { recursive: true });
await writeFile(archive, Buffer.concat([...localParts, directory, end]));
console.log(`\nHostinger build verified for https://jordangeach.com${base}`);
console.log(`Files: ${output}`);
console.log(`Upload archive: ${archive}`);
console.log(
  "Extract the archive contents directly into public_html/krillion/.",
);
