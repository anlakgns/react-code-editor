import { ActionType } from '../action-creators/actionTypes';
import { Action } from '../action-creators/actionCreatorTypes';
import { Cell } from '../cellTypes';
import { produce } from 'immer';


// Here we use immer. Immer basically simplifies handling immutable data structure. In react and redux, we need to be aware of that we should use immutable objects, so it means we need to create a new object/array and should return it everytime.  The structure doesn't force us to keep that mentality so it means we are prone to make error. The immer makes this process easier and satifies these immutable restriction by itself. Also in nested objects, making immutable condition is a bit hard so immer helps us in this condition very efficiently.

// All types return state, it is meanningles with immer but we do it because of typescript. It thinks the reducers may return undefined if we dont do that.


interface CellState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
}

const initialState: CellState = {
  loading: false,
  error: null,
  order: [],
  data: {},
};

const reducer = produce((
  state: CellState = initialState,
  action: Action
): CellState => {
  switch (action.type) {
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      state.data[id].content = content;
      return state;

    case ActionType.DELETE_CELL:
      delete state.data[action.payload.id]; // delete from data
      state.order = state.order.filter((id) => id !== action.payload.id); // delete from order array.
      return state;

    case ActionType.MOVE_CELL:
      const { direction } = action.payload;
      const index = state.order.findIndex((id) => id === action.payload.id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      // shortcut for boundries
      if (targetIndex < 0 || targetIndex > state.order.length - 1) {
        return state; // for TS
      }

      // swap the id items
      state.order[index] = state.order[targetIndex];
      state.order[targetIndex] = action.payload.id;

      return state;

    case ActionType.INSERT_CELL_BEFORE:
      const cell: Cell = {
        content: '',
        type: action.payload.type,
        id: randomId(),
      };
      state.data[cell.id] = cell;

      const foundIndex = state.order.findIndex(
        (id) => id === action.payload.id
      );

      if (foundIndex < 0) {
        state.order.push(cell.id);
      } else {
        state.order.splice(foundIndex, 0, cell.id);
      }
      return state;

    default:
      return state;
  }
})

const randomId = () => {
  return Math.random().toString(36).substr(2, 5);
};

export default reducer;

