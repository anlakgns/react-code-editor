import cellsReducer from './cellReducer'
import {combineReducers} from 'redux'

const reducers = combineReducers({
  cells: cellsReducer
});

export default reducers

export type RootState = ReturnType<typeof reducers>