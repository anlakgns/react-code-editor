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

        // checker filetype whether it is js or css
        // in browser we can't create two file, esbuild wants to build 2 file for one js and the other one for css. In this way we somehow trick the esbuild to insert css.
        const fileType = args.path.match(/.css$/) ? 'css' : 'jsx';
        const escaped = data
          .replace(/\n/g, '') // new lines removed.
          .replace(/"/g, '\\"') // double quotas escaped
          .replace(/'/g, "\\'") // single quotes escaped
        const contents =
          fileType === 'css'
          ? `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style)
        `
          : data;


        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };

        // store it in cached
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
