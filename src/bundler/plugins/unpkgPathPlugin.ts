import * as esbuild from 'esbuild-wasm';




export const unpkgPathPlugin = () => {
  return {

    // we named this for debugging purposes.
    name: 'unpkg-path-plugin',

    // bu setup, esbuild de 'build' api kullanıldıkça otomatik olarak çalışıcak.
    setup(build: esbuild.PluginBuild) {

      // onResolve : figure out where file is stored
      // here we override natural default process of esbuild.
      // returns the file path 


      // path finder for index.js
      build.onResolve({filter: /(^index\.js$)/}, ()=> {
        return {
          path: 'index.js', namespace: 'a'
        }
      })
  
      // path finder:  relative paths ./ or ../
      build.onResolve({filter: /^\.+\//}, (args: any)=> {
        console.log(args.path)
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href
        }
      })


     
      // path finder : root package such as 'react' vs...
      build.onResolve({ filter: /.*/ }, async (args: any) => {
       
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }  
      })

    },
  };
};

// The filter and namespace is totally for filtering. Sometimes we may want to work this plugin in some special files, we can use them for these kind of as a filter.

// This plugin works recursively till all files load.