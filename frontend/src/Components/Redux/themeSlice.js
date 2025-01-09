import { createSlice } from "@reduxjs/toolkit";

export const themeslice =createSlice({
    name:"themeslice",
    initialState:true,
    reducers:{
        toggletheme:(state)=>{
            return !state
        }
    }
})
export const {toggletheme}=themeslice.actions
export default themeslice.reducer