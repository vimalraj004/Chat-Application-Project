import themeSliceReducer from "./themeSlice";
import refreshsidebarReducer from "./refreshsidebar"
import { configureStore } from "@reduxjs/toolkit";


export const store =configureStore({
    reducer:{
        themekey:themeSliceReducer,
       refreshsidebar:refreshsidebarReducer
    }
})