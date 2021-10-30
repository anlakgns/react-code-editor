import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkgPathPlugin';
import { fetchPlugin } from './plugins/fetch-plugin';

let service: esbuild.Service;
const bundle = async (rawCode: string) => {
  
  if (!service) {
    // The service object here is going to do all stuff bundling and tranforming/transpiling. We need it anyway. This is the way we can be sure we have it always. The service object will return us 4 function so that we can use : build, serve, stop and transform. We will use build and transform. Transform just do transpiling not any bundling. Bundle function is self-explanatory. 
    service = await esbuild.startService({
      worker: true,

      // this is the bundler written in go, compiled to work in the browser. It is a web assebly binary file.
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  }

  // we have service and we can bundle now.
  try {
    const result = await service.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      // the order in plugins matters.
      plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
      define: {
        'process.env.NODE_ENV': '"production"', // to fix a bug
        global: 'window', // to fix a bug
      },
    });

    // bundled code.
    return {
      code: result.outputFiles[0].text,
      err: ""
    }
  } catch (err) {
    return {
      code: "",
      err: err.message,
    }
  }
};

export default bundle;
