import {configureStore} from '@reduxjs/toolkit'
import socketReducer from '../Features/storeslice'

const store=configureStore({
    reducer: {
        socket: socketReducer,
    }
});

export default store;