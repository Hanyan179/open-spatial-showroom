import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),base:'./',plugins:[react()],build:{outDir:'../../public/modules/product-explorer',emptyOutDir:true,chunkSizeWarningLimit:1500}});
