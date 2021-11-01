import useTypedSelector from '../../hooks/use-typed-selector';
import CellListItem from './cell-list-item';
import AddCell from '../subComponents/add-cell';
import { Fragment } from 'react';
import './cell-list.css';

const CellList: React.FC = () => {
  const cells = useTypedSelector(({ cells: { data, order } }) =>
    order.map((id) => data[id])
  );

  const renderedCells = cells.map((cell) => (
    <Fragment key={cell.id}>
      <AddCell nextCellId={cell.id} />
      <CellListItem cell={cell} />
    </Fragment>
  ));

  return (
    <div className="cell-list">
      {renderedCells}
      <AddCell forceVisible={cells.length === 0} nextCellId={null} />
    </div>
  );
};

export default CellList;
