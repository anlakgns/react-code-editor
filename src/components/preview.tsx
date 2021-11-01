import { useRef, useEffect } from 'react';
import './preview.css';
interface PreviewPros {
  code: string;
  err: string;
}

// default html and script.
// We wanted to put code inside html {} with bracets but some browser limit the size of attributes. 
// we put this code inside the srcDoc attribute. That's why we need a walkaround to handle this.
// There is a light and secure communication way between parent-child which is a spesific event. 
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
// Basically we put a eventlistener in child to listen the parent for a spesific event : message.
// The rest of the default script is about error handling in preview, not the consule, for better UX

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
    // having fresh html&script structure eveytime. 
    iframe.current.srcdoc = html;

    // sending event to say: new code has arrived.
    setTimeout(() => {
      // need some time to send event. * means domains restriction. so any domain can receive these message. For further security option.
      iframe.current.contentWindow.postMessage(code, '*');
    }, 50);
  }, [code]);

  return (
    // wrapper is added to fix bug. There was a problem with dragging reisizer.
    <div className="iframe-wrapper"> 
      <iframe  // iframe provide us an isolated place to execute code.
        ref={iframe}
        title="code preview"
        sandbox="allow-scripts" // break the communication with parent for security. We want to put the user code in the html we define in srcDoc, so we need to let the frame use this script so we choose allow-scripts.
        srcDoc={html} // allow us to insert html/content 
      />
      {err && <div className="preview-error">{err}</div>}
    </div>
  );
};

export default Preview;


// There is a security issue with iframe. From child to parent , "parent" keyword and from parent to child with querySelector and contentWindow method, we can communicate. So there is a bidirectional communication between these places and causes security vulnerability. We prevent it sandbox attribute.
