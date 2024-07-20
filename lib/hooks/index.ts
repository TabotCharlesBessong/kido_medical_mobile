import {
  TypedUseSelectorHook,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from 'react-redux'

import { RootState, AppDispatch } from '@/redux/store'

export const useAppDispatch = () => useReduxDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector
