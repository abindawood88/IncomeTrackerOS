const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ts = require("typescript");

if (typeof global.localStorage === "undefined") {
  const store = new Map();
  global.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

require.extensions[".ts"] = function registerTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const engineResult = spawnSync(process.execPath, [path.resolve(__dirname, "engine.test.js")], {
  stdio: "inherit",
});

let failures = engineResult.status === 0 ? 0 : 1;

const tests = fs
  .readdirSync(path.resolve(process.cwd(), "__tests__"))
  .filter((file) => file.endsWith(".test.ts"))
  .sort()
  .map((file) => path.resolve(process.cwd(), "__tests__", file));

for (const testFile of tests) {
  try {
    require(testFile);
    console.log(`PASS ${path.relative(process.cwd(), testFile)}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${path.relative(process.cwd(), testFile)}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exit(1);
}
