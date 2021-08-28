import { ResizableBox, ResizableBoxProps } from 'react-resizable';
import './resizable.css'
import {useEffect, useState} from 'react'

interface ResizableProps {
  direction: 'horizontal' | 'vertical'; // kind of enum
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    const [innerHeight, setInnerHeight] = useState(window.innerHeight)
    const [innerWidth, setInnerWidth] = useState(window.innerWidth)
    const [width, setWidth] = useState(window.innerWidth * 0.75)

  // To make window.inner.. reponsive
  // De bouncing 
  useEffect(()=> {
    let timer: any;
    const listener = () => {
      if(timer) {
        clearTimeout(timer)
      }
     timer = setTimeout(()=> {
       setInnerHeight(window.innerHeight)
       setInnerWidth(window.innerWidth)
       if(window.innerWidth * 0.75 < width) {
         setWidth(window.innerWidth * 0.75)
        }
     }, 100)
    
    }
    window.addEventListener('resize', listener)

    return () => {
      window.removeEventListener('resize', listener)
    }
  },[width])

  let resizableProps: ResizableBoxProps;

  if(direction === 'horizontal') {
    resizableProps = {
      className: 'resize-horizontal',
      minConstraints: [innerWidth*0.2, Infinity],
      maxConstraints: [innerWidth*0.75, Infinity ],
      height: Infinity, 
      width: width,
      resizeHandles: ['e'],
      onResizeStop: (_, data) => {
        setWidth(data.size.width)
      }
    }
  } else {
    resizableProps = {
      maxConstraints: [Infinity, innerHeight*0.9],
      minConstraints: [Infinity, 24],
      height: 300, 
      width: Infinity,
      resizeHandles: ['s'],
    }
  }
    
  return (
    <ResizableBox {...resizableProps} >
      {children}
    </ResizableBox>
  );
};

export default Resizable;
