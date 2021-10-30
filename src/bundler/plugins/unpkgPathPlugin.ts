import * as esbuild from 'esbuild-wasm';

// These plugin is created for the sole purpose of the feature we want to import libraries with a syntax
// such as  ** import React from "react" **

export const unpkgPathPlugin = () => {
  return {
    // we named this for debugging purposes.
    name: 'unpkg-path-plugin',

    // bu setup, esbuild de 'build' api kullanıldıkça otomatik olarak çalışıcak.
    setup(build: esbuild.PluginBuild) {
      // onResolve : override the path of imports - esbuild checks fs system as default we dont want that for some imports.
      // returns the file path we want
      // filter - just filters depending on paths.

      // path finder for index.js
      // entry point for bundle.
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return {
          path: 'index.js',
          namespace: 'a',
        };
      });

      // path finder:  some libraries we want to fetch can be have nested files and these nested files can have imports paths as or ./ ../main and so on. That'why we also override them as well.
      // new URL create a URL object for us. href is the full url we want so we return it.

      // args.resolveDir burda bulunan son folder pathını veriyor. sallıyorum src/components/navbar.js içindeki relative bir importandan bahsediyorsak, bu resolve dir "/src/components/" bu pathi veriyor
      // args.path - import card from './card"  - burdaki "./card" pathini veriyor.

      // filter for "./" or "../"
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href,
        };
      });

      // path finder : root package such as 'react' vs...
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};

// The filter and namespace is totally for filtering. Sometimes we may want to work this plugin in some special files, we can use them for these kind of as a filter.

// This plugin works recursively till all files load.
