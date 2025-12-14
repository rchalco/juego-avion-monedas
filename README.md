# 🚀 Juego de Avión y Monedas

Juego arcade donde controlas un avión que debe disparar y romper monedas mientras esquiva obstáculos.

## 🎮 Características

- **3 tipos de monedas**: Oro (100 pts), Plata (40 pts), Bronce (15 pts)
- **2 niveles** de dificultad progresiva
- **Sistema de mejoras**: Compra proyectiles con doble daño
- **Efectos visuales** y animaciones
- Desarrollado con **TypeScript**, **Canvas HTML5** y **CSS**

## 🚀 Instalación y Ejecución

### Requisitos

- [Bun](https://bun.sh) instalado

### Comandos

```bash
# Instalar dependencias
bun install

# Modo desarrollo (con servidor)
bun run dev

# Build para SPA (funciona sin servidor)
bun run build

# Abrir el juego directamente en el navegador
bun run open
# O simplemente abre dist/index.html en tu navegador
```

### 🎯 Dos formas de jugar:

1. **Desarrollo** (con recarga automática):

   ```bash
   bun run dev
   ```

   Abre http://localhost:3000

2. **SPA** (sin servidor):
   ```bash
   bun run build
   bun run open
   ```
   O abre manualmente `dist/index.html` en tu navegador

## 🎯 Controles

- **WASD** o **Flechas**: Mover avión
- **Espacio**: Disparar
- **ESC** o **P**: Pausa
- **T**: Abrir tienda (Nivel 2)

## 📊 Mecánicas del Juego

### Nivel 1

- Objetivo: 800 puntos
- Esquiva rocas y dispara a las monedas

### Nivel 2

- Objetivo: 5000 puntos
- Rocas más grandes y rápidas
- Tienda disponible para comprar mejoras

## 🪙 Sistema de Monedas

| Tipo   | Disparos necesarios | Puntos |
| ------ | ------------------- | ------ |
| Oro    | 25                  | 100    |
| Plata  | 12                  | 40     |
| Bronce | 8                   | 15     |

## 📝 Licencia

MIT
