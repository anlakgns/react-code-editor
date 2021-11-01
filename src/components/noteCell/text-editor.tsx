import MDEditor from '@uiw/react-md-editor';
import { useState, useEffect, useRef } from 'react';
import './text-editor.css';
import { Cell } from '../../state';
import {useActions} from '../../hooks/use-actions'
interface TextEditorProps {
  cell: Cell;
}

const TextEditor: React.FC<TextEditorProps> = ({cell}) => {
  const {updateCell} = useActions()
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      
      // guard: not trigger if the editor is clicked.
      if (
        ref.current &&
        event.target &&
        ref.current.contains(event.target as Node)
      ) {
        return;
      }

      setEditing(false);
    };

    document.addEventListener('click', listener, { capture: true });

    return () => {
      document.removeEventListener('click', listener, { capture: true });
    };
  }, []);

  if (editing) {
    return (
      <div ref={ref} className="text-editor">
        <MDEditor value={cell.content} onChange={(v) => updateCell(cell.id, v || '')} />
      </div>
    );
  }

  return (
    <div onClick={(e) => setEditing(true)} className="text-editor card">
      <div className="card-content">
        <MDEditor.Markdown source={cell.content || 'Click to Edit'} />
      </div>
    </div>
  );
};

export default TextEditor;
