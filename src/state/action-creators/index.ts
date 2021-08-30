import { Dispatch} from 'redux'
import { ActionType } from '../action-types';
import { CellTypes } from '../cell';
import {
  UpdateCellAction,
  DeleteCellAction,
  MoveCellAction,
  InsertCellBeforeAction,
  BundleStartAction,
  BundleCompleteAction,
  Direction,
  Action
} from '../actions';
import bundle from '../../bundler'

export const updateCell = (id: string, content: string): UpdateCellAction => {
  return {
    type: ActionType.UPDATE_CELL,
    payload: {
      id: id,
      content: content,
    },
  };
};

export const deleteCell = (id: string): DeleteCellAction => {
  return {
    type: ActionType.DELETE_CELL,
    payload: {
      id: id,
    },
  };
};

export const moveCell = (id: string, direction: Direction): MoveCellAction => {
  return {
    type: ActionType.MOVE_CELL,
    payload: {
      id: id,
      direction: direction,
    },
  };
};

export const insertCellBefore = (
  id: string | null,
  cellType: CellTypes
): InsertCellBeforeAction => {
  return {
    type: ActionType.INSERT_CELL_BEFORE,
    payload: {
      id: id,
      type: cellType,
    },
  };
};

export const createBundle = (id: string, input: string ) => {
  return async (dispatch : Dispatch<Action>) => {
    dispatch({
      type: ActionType.BUNDLE_START,
      payload: {
        id: id
      }
    })

    const result = await bundle(input)

    dispatch({
      type: ActionType.BUNDLE_COMPLETE,
      payload: {
          id: id,
          bundle: result.code,
          err: result.err
        }
    })
  }
}