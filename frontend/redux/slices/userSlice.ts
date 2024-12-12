// userSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loggedIn: false, // Tracks login status
    userDetails: null,
  },
  reducers: {
    setUser(state, action) {
      state.loggedIn = true; // Set logged-in state to true
      state.userDetails = action.payload;
    },
    clearUser(state) {
      state.loggedIn = false; // Reset logged-in state to false
      state.userDetails = null;
    },
  },
});


export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
