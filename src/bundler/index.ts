import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkgPathPlugin';
import { fetchPlugin } from './plugins/fetch-plugin';

let service: esbuild.Service;
const bundle =  async (rawCode: string) => {

  // Guard for Start Service. No need to service for every code snippets
  if(!service) {
    service = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  }

  // doing bundling
  const result = await service.build({
    entryPoints: ['index.js'],
    bundle: true,
    write: false,
    // the order in plugins matters.
    plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
    define: {
      'process.env.NODE_ENV': '"production"',
      global: 'window',
    },
  });
  
  // bundled code.
  return result.outputFiles[0].text
}

export default bundle