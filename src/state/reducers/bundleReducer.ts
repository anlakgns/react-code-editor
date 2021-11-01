import produce from 'immer';
import { ActionType } from '../action-creators/actionTypes';
import { Action } from '../action-creators/actionCreatorTypes';

// Here we use immer. Immer basically simplifies handling immutable data structure. In react and redux, we need to be aware of that we should use immutable objects, so it means we need to create a new object/array and should return it.  The structure doesn't force us to keep that mentality so it means we are prone to make error. The immer makes this process easier and satifies these immutable restriction by itself. Also in nested objects, making immutable condition is a bit hard so immer helps us in this condition very efficiently.

// All types return state, it is meanningles with immer but we do it because of typescript. It thinks the reducers may return undefined if we dont do that.


interface BundleState {
  [key: string]: {
    loading: boolean;
    code: string;
    err: string;
  } | undefined;
}

const initialState: BundleState = {};

const reducer = produce(
  (state: BundleState = initialState, action: Action): BundleState => {
    switch (action.type) {
      case ActionType.BUNDLE_START:
        state[action.payload.id] = {
          loading: true,
          code: '',
          err: '',
        };
        return state;

      case ActionType.BUNDLE_COMPLETE:
        state[action.payload.id] = {
          loading: false,
          code: action.payload.bundle,
          err: action.payload.err,
        };

        return state;
      default:
        return state;
    }
  }
);

export default reducer;
