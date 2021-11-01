import { Cell } from '../../state';
import CodeCell from '../codePreviewCell/code-cell';
import TextEditor from '../noteCell/text-editor';
import ActionBar from '../subComponents/action-bar';
import './cell-list-item.css';

interface CellListItemProps {
  cell: Cell;
}

const CellListItem: React.FC<CellListItemProps> = ({ cell }) => {
  let child: JSX.Element;

  if (cell.type === 'code') {
    child = (
      <>
        <div className="action-bar-wrapper"></div>
        <CodeCell cell={cell} />
      </>
    );
  } else {
    child = <TextEditor cell={cell} />;
  }

  return (
    <div className="cell-list-item">
      {child}
      <ActionBar id={cell.id} />
    </div>
  );
};

export default CellListItem;
