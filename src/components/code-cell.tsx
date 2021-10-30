import './code-cell.css';
import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks/use-actions';
import useTypedSelector from '../hooks/use-typed-selector';
interface CodeCellProps {
  cell: Cell;
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  const { updateCell, createBundle } = useActions();
  const bundle = useTypedSelector((state) => state.bundles[cell.id]);
  const cumulativeCode = useTypedSelector((state) => {
    const { data, order } = state.cells;

    let allCode: string[] = [
      `
      import React from "react"
      import ReactDOM from "react-dom"   

      const show = (value)=> {
        const root = document.querySelector('#root')
        
        if(typeof value === "object") {
          if(value.$$typeof && value.props) {
            ReactDOM.render(value,root)
          } else {
            root.innerHTML = JSON.stringify(value)
          }
        } else {
          root.innerHTML = value
        }
      }`,
    ];
    for (let i = 0; i < order.length; i++) {
      const cellId = order[i];
      if (data[cellId]?.type === 'code') {
        allCode.push(data[cellId].content);
      }

      if (data[cellId].id === cell.id) {
        break;
      }
    }

    return allCode.join('\n');
  });

  // Debouncing : means grouping multiple sequantial calls into one. Performance improvement.
  useEffect(() => {
    if (!bundle) {
      createBundle(cell.id, cumulativeCode);
      return;
    }

    const timer = setTimeout(async () => {
      createBundle(cell.id, cumulativeCode);
    }, 750);

    return () => {
      clearTimeout(timer);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumulativeCode, cell.id, createBundle]);

  return (
    <Resizable direction="vertical">
      <div
        style={{
          height: 'calc(100% - 10px)',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Resizable direction="horizontal">
          <CodeEditor
            initialValue={cell.content}
            onChange={(value: string) => updateCell(cell.id, value)}
          />
        </Resizable>
        <div className="progress-wrapper">
          {!bundle || bundle.loading ? (
            <div className="progress-cover">
              <progress
                className="progress is-small is-primary"
                max="100"
              ></progress>
            </div>
          ) : (
            <Preview code={bundle.code} err={bundle.err} />
          )}
        </div>
      </div>
    </Resizable>
  );
};

export default CodeCell;
