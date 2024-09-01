import { createSlice,nanoid} from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn: localStorage.getItem('accessToken'),
    user:JSON.parse(localStorage.getItem('user')) || {},
}

export const storeSlice=createSlice({
    name: 'store',
    initialState,
    reducers:{
        makeLogin: (state,action)=>{
            state.isLoggedIn=true;
            state.user=action.payload
        },
        makeLogout:(state,action)=>{
            state.isLoggedIn=false;
            state.user={};
        },
    }
})

//EXPORTING REDUCERS
export const {makeLogin,makeLogout,fillsubscibedChannels} =storeSlice.actions

//CONNECTING STORE WITH REDUCERS
export default storeSlice.reducer