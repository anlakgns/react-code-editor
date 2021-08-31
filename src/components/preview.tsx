import { useRef, useEffect } from 'react';
import './preview.css';
interface PreviewPros {
  code: string;
  err: string;
}

// default html and script.
const html = `
  <html>
    <head>
      <style> html {background-color: white;} </style>
    </head>
    <body>
      <div id="root"></div>
      <script>

        const handleError = (err) => {
          const root = document.querySelector('#root')
          root.innerHTML = '<div style="color: red"><h4>Runtime Error</h4>' + err + '</div>'
          console.error(err)
        }

        window.addEventListener('error', (event)=> {
          event.preventDefault()
          handleError(event.error)
        })

        window.addEventListener('message', (event) => {
          try {
            eval(event.data)
          } catch(err) {
            handleError(err)
          }
        });
      </script>
    </body>
  </html>
  `;

const Preview: React.FC<PreviewPros> = ({ code, err }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    // having fresh html&script structure eveytime
    iframe.current.srcdoc = html;

    // sending event to say: new code has arrived.
    setTimeout(() => {
      // need some time to send event.
      iframe.current.contentWindow.postMessage(code, '*');
    }, 50);
  }, [code]);

  return (
    <div className="iframe-wrapper">
      <iframe
        ref={iframe}
        title="code preview"
        sandbox="allow-scripts"
        srcDoc={html}
      />
      {err && <div className="preview-error">{err}</div>}
    </div>
  );
};

export default Preview;
