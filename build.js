import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import esbuild from "esbuild";

console.log("📦 Construyendo el juego SPA...");

try {
  // Crear directorio dist si no existe
  if (!existsSync("./dist")) {
    await mkdir("./dist", { recursive: true });
  }

  // 1. Build del JavaScript con bundling completo usando esbuild
  await esbuild.build({
    entryPoints: ["./src/main.ts"],
    outdir: "./dist",
    target: "es2020",
    format: "esm",
    minify: true,
    sourcemap: true,
    bundle: true,
  });

  console.log("✅ JavaScript compilado y bundled");

  // 2. Leer y modificar el index.html para usar el JS compilado
  let htmlContent = await readFile("./src/index.html", "utf-8");
  // Reemplazar la referencia al TypeScript por el JavaScript compilado
  htmlContent = htmlContent.replace(/main\.ts/g, "main.js");

  // 3. Copiar archivos estáticos y escribir HTML modificado
  await mkdir("./dist", { recursive: true });
  await writeFile("./dist/index.html", htmlContent, "utf-8");
  console.log("✅ index.html copiado a dist/");

  // 4. Copiar estilos CSS
  if (existsSync("./src/styles")) {
    await mkdir("./dist/styles", { recursive: true });
    const cssFile = await readFile("./src/styles/main.css", "utf-8");
    await writeFile("./dist/styles/main.css", cssFile, "utf-8");
    console.log("✅ Estilos CSS copiados");
  }

  console.log("✅ ¡Build completado exitosamente!");
} catch (error) {
  console.error("❌ Error en el build:", error.message);
  process.exit(1);
}
