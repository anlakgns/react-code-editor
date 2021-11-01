import cellsReducer from './cellReducer';
import bundleReducer from './bundleReducer'
import { combineReducers } from 'redux';


const reducers = combineReducers({
  cells: cellsReducer,
  bundles: bundleReducer
});

export default reducers;

// weird syntax comes from typescript-redux.
export type RootState = ReturnType<typeof reducers>;
