import {defineConfig} from 'vite';
import {NodePackageImporter} from 'sass';
import path from 'node:path';
export default defineConfig({base:'./',resolve:{alias:{'@REACTOR_ICONS':path.resolve('node_modules/@reactor/style/src/assets/figma')}},esbuild:{jsx:'automatic'},optimizeDeps:{esbuildOptions:{jsx:'automatic'}},css:{preprocessorOptions:{scss:{importers:[new NodePackageImporter()],silenceDeprecations:['legacy-js-api','import','global-builtin','color-functions']}}},build:{assetsInlineLimit:20000000,rollupOptions:{input:'development.html',output:{inlineDynamicImports:true}},chunkSizeWarningLimit:8000}});
