import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

// we override the paths in unpkgPathPlugin as we want, now time to override the load/fetch feature.

// to minimize the request, we use indexedDB for caching. In some browsers local storage space is limited so we use indexedDB.
const fileCache = localForage.createInstance({
  name: 'filecache',
});

// this will be called always before build method.
export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetchPlugin',
    setup(build: esbuild.PluginBuild) {
      // loader for index.js
      // this is entry point / we assume that it will jsx, can be customizable later.
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: inputCode,
        };
      });

      // kind of middleware for checking cache
      // not : if we don't return anything, it will keep looking the onload functions till have a return. If it can't find, it will throw an error.
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // Checked cached first
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        // if found, return immediately
        if (cachedResult) {
          return cachedResult;
        }
      });

      // loader for css files
      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        // in browser we can't create two file, so we need to trick esbuild. we take our css data and wrap it with js and append into dom.

        // the quotes conflicts here so we need to escape them.
        const escaped = data
          .replace(/\n/g, '') // new lines removed.
          .replace(/"/g, '\\"') // double quotas escaped
          .replace(/'/g, "\\'"); // single quotes escaped
        const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style)
          `;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };

        // store it in cached
        await fileCache.setItem(args.path, result);

        return result;
      });

      // loader for plain javascript files.
      build.onLoad({ filter: /.*/ }, async (args: any) => {
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
