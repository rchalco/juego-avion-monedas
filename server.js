import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// Crear directorio dist si no existe
if (!existsSync("./dist")) {
  await mkdir("./dist", { recursive: true });
}

// Realizar un build inicial
console.log("🔨 Realizando build inicial...");
try {
  await esbuild.build({
    entryPoints: ["./src/main.ts"],
    outdir: "./dist",
    target: "es2020",
    format: "esm",
    minify: false,
    sourcemap: true,
    bundle: true,
  });
  console.log("✅ Build inicial completado");
} catch (error) {
  console.error("❌ Error en el build:", error.message);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    // Servir el index.html en la raíz
    if (url.pathname === "/" || url.pathname === "/index.html") {
      let htmlContent = await readFile("./src/index.html", "utf-8");
      htmlContent = htmlContent.replace(/main\.ts/g, "main.js");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(htmlContent);
      return;
    }

    // Servir archivos CSS
    if (url.pathname.endsWith(".css")) {
      const filePath = path.join(__dirname, "src", url.pathname);
      try {
        const content = await readFile(filePath, "utf-8");
        res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
        res.end(content);
        return;
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("CSS not found");
        return;
      }
    }

    // Servir archivos JavaScript (incluyendo main.js)
    if (url.pathname.endsWith(".js") || url.pathname.endsWith(".js.map")) {
      const filePath = path.join(__dirname, "dist", url.pathname);
      try {
        const content = await readFile(filePath);
        const contentType = url.pathname.endsWith(".map")
          ? "application/json"
          : "application/javascript";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
        return;
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("JavaScript not found");
        return;
      }
    }

    // Servir archivos TypeScript compilados bajo demanda
    if (url.pathname.endsWith(".ts")) {
      const filePath = path.join(__dirname, "src", url.pathname);
      try {
        const result = await esbuild.build({
          entryPoints: [filePath],
          target: "es2020",
          format: "esm",
          bundle: false,
          write: false,
        });

        if (result.outputFiles && result.outputFiles[0]) {
          res.writeHead(200, { "Content-Type": "application/javascript" });
          res.end(result.outputFiles[0].contents);
          return;
        }
      } catch (error) {
        console.error(`Error transpilando ${filePath}:`, error.message);
      }
    }

    // 404 por defecto
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not Found");
  } catch (error) {
    console.error("Error en el servidor:", error.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 - Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Carpeta del proyecto: ${__dirname}`);
});
