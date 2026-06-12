import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        rolldownOptions: {
            output: {
                minify: {
                    compress: {
                        dropConsole: true,
                        dropDebugger: true,
                    },
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                // facultatif : réécrit l'URL si le backend n’a pas de préfixe /api
                // rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
})
