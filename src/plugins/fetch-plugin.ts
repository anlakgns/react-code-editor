import * as esbuild from 'esbuild-wasm';
import axios from 'axios'
import localForage from 'localforage'

// to minimize the request, we use indexedDB for caching.
const fileCache = localForage.createInstance({
  name: 'filecache'
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetchPlugin',
    setup(build: esbuild.PluginBuild) {
      
      // Don't let it try to load up something on the file system instead.
      // override the natural way of loading up a file.
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          };
        }

        // Checked cached first
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        // if found, return immediately
        if (cachedResult) {
          return cachedResult;
        }

        // if not found, make a request.
        const { data, request } = await axios.get(args.path);
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };

        // store it in cached
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
