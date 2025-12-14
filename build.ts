import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

console.log("📦 Construyendo el juego SPA...");

// 1. Build del JavaScript con bundling completo
const buildResult = await Bun.build({
  entrypoints: ["./src/main.ts"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "external",
  naming: {
    entry: "main.js",
  },
});

if (!buildResult.success) {
  console.error("❌ Error en el build:");
  for (const log of buildResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("✅ JavaScript compilado y bundled");

// 2. Leer y modificar el index.html para usar el JS compilado
let htmlContent = await readFile("./src/index.html", "utf-8");
// Reemplazar la referencia al TypeScript por el JavaScript compilado
htmlContent = htmlContent.replace(
  '<script type="module" src="main.ts"></script>',
  '<script src="main.js"></script>'
);
await writeFile("./dist/index.html", htmlContent);
console.log("✅ HTML generado para SPA");

// 3. Copiar estilos
if (!existsSync("./dist/styles")) {
  await mkdir("./dist/styles", { recursive: true });
}
await copyFile("./src/styles/main.css", "./dist/styles/main.css");
console.log("✅ CSS copiado");

console.log("\n🎉 Build completado en ./dist");
console.log("📂 Abre dist/index.html en tu navegador para jugar");
console.log("💡 O ejecuta: start dist/index.html");
