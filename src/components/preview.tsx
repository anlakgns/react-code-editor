import { useRef, useEffect } from 'react';

interface PreviewPros {
  code: string
}


// default html and script.
const html = `
  <html>
    <head></head>
    <body>
      <div id="root"></div>
      <script>
        window.addEventListener('message', (event) => {
          try {
            eval(event.data)
          } catch(err) {
            const root = document.querySelector('#root')
            root.innerHTML = '<div style="color: red"><h4>Runtime Error</h4>' + err + '</div>'
            console.error(err)
          }
        });
      </script>
    </body>
  </html>
  `


const Preview: React.FC<PreviewPros> = ({code}) => {
  const iframe = useRef<any>();

  useEffect(()=> {

    // having fresh html&script structure eveytime
    iframe.current.srcdoc = html

    // sending event to say: new code has arrived.
    iframe.current.contentWindow.postMessage(code, '*')

  },[code])
  
  return <iframe ref={iframe} title="code preview" sandbox="allow-scripts" srcDoc={html}/>;
};

export default Preview;
