import * as esbuild from 'esbuild-wasm';
import axios from 'axios'
import localForage from 'localforage'

// to minimize the request, we use indexedDB for caching.
const fileCache = localForage.createInstance({
  name: 'filecache'
});

(async () => {
  await localForage.setItem('color', 'red');

  const color = await localForage.getItem('color');

  console.log(color)
})()



export const unpkgPathPlugin = () => {
  return {

    // we named this for debugging purposes.
    name: 'unpkg-path-plugin',

    // bu setup, esbuild de 'build' api kullanıldıkça otomatik olarak çalışıcak.
    setup(build: esbuild.PluginBuild) {

      // onResolve ve onLoad 2 farklı listener. 


      // onResolve : figure out where file is stored
      // here we override natural default process of esbuild.
      // returns the file path 
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args);
        if(args.path === "index.js") {
          return { path: args.path, namespace: 'a' };
        } 

        if(args.path.includes('./' || args.path.includes('../'))) {
          return {
            namespace: 'a',
            path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href
          }
        }
        
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }
        
      })
 
      // Don't let it try to load up something on the file system instead.
      // override the natural way of loading up a file.
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);
 
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
              import message from 'react';
              console.log(message);
            `,
          };
        } 

        // Checked cached first
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path)

        // if found, return immediately
        if(cachedResult) {
          return cachedResult
        }

        // if not found, make a request.
        const {data, request} = await axios.get(args.path);
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname
        }

        // store it in cached
        await fileCache.setItem(args.path, result)
 
        return result

      });
    },
  };
};

// The filter and namespace is totally for filtering. Sometimes we may want to work this plugin in some special files, we can use them for these kind of as a filter.

// This plugin works recursively till all files load.