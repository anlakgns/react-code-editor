import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

// to minimize the request, we use indexedDB for caching.
const fileCache = localForage.createInstance({
  name: 'filecache',
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetchPlugin',
    setup(build: esbuild.PluginBuild) {
      // loader for index.js
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

        // checker filetype whether it is js or css
        // in browser we can't create two file, esbuild wants to build 2 file for one js and the other one for css. In this way we somehow trick the esbuild to insert css.
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
