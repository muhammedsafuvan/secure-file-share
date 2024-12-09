import { configureStore } from "@reduxjs/toolkit";
import userSlice from "@/redux/slices/userSlice";

const store = configureStore({
  reducer: {
    user: userSlice, // Add your reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
