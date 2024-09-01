import {configureStore} from '@reduxjs/toolkit'
import storeReducer from '../Features/storeslice'

export const store=configureStore({
    reducer: storeReducer
});