import { createSlice } from "@reduxjs/toolkit";


export const refreshsidebar = createSlice({
    name:"refreshsidebar",
    initialState:{
        refresh:true,
        Socket:false,
        allusers:[]
    },
    reducers:{
            refreshsidebarfun:(state)=>{
                return(!state)
            },
            setsocket:(state,action)=>{
              state.Socket = action.payload
            },
            setallusers:(state,action)=>{
                state.allusers = action.payload
            }

    }
})
export const {refreshsidebarfun,setsocket,setallusers}=refreshsidebar.actions
export default refreshsidebar.reducer