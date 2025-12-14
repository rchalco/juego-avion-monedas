const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Servir el index.html en la raíz
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file("src/index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Servir archivos TypeScript transpilados a JavaScript
    if (url.pathname.endsWith(".ts")) {
      const filePath = `src${url.pathname}`;
      try {
        const file = Bun.file(filePath);
        const content = await file.text();

        // Transpilar TypeScript a JavaScript
        const transpiled = await Bun.build({
          entrypoints: [filePath],
          target: "browser",
        });

        if (transpiled.outputs[0]) {
          return new Response(transpiled.outputs[0], {
            headers: { "Content-Type": "application/javascript" },
          });
        }
      } catch (e) {
        console.error(`Error cargando ${filePath}:`, e);
        return new Response("Error loading file", { status: 404 });
      }
    }

    // Servir archivos CSS
    if (url.pathname.endsWith(".css")) {
      const filePath = `src${url.pathname}`;
      return new Response(Bun.file(filePath), {
        headers: { "Content-Type": "text/css" },
      });
    }

    // Servir otros archivos desde src/
    const filePath = `src${url.pathname}`;
    return new Response(Bun.file(filePath));
  },
});

console.log(
  `🎮 Servidor del juego corriendo en http://localhost:${server.port}`
);
