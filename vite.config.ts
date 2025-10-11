import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: '/',
  server: {
    fs: {
      strict: false
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0, // Don't inline assets, use relative paths
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    }
  },
  plugins: [
    vue({
      script: {
        defineModel: true
      }
    }),
    electron([
      {
        // Main process entry point
        entry: resolve(__dirname, 'electron/main.js'),
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: true,
          },
        },
      },
    ]),
    renderer(),
    // Custom plugin to fix asset paths for Electron - DISABLED FOR DEV TESTING
    // {
    //   name: 'fix-asset-paths',
    //   generateBundle(options, bundle) {
    //     for (const fileName in bundle) {
    //       const chunk = bundle[fileName];
    //       if (chunk.type === 'chunk' && chunk.code) {
    //         // Only fix specific asset path patterns, avoid over-replacement
    //         chunk.code = chunk.code.replace(/"\/assets\//g, '"./assets/');
    //         chunk.code = chunk.code.replace(/'\/assets\//g, "'./assets/");
    //         
    //         // Fix specific error patterns
    //         chunk.code = chunk.code.replace(/preload CSS for \/assets\//g, 'preload CSS for ./assets/');
    //         chunk.code = chunk.code.replace(/Unable to preload CSS for \/assets\//g, 'Unable to preload CSS for ./assets/');
    //       }
    //     }
    //   }
    // }
  ],
  publicDir: 'public',
  esbuild: {
    target: 'esnext'
  }
})