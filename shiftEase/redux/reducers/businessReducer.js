import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    businessInfo: null,
    loading: false,
    error: null,
    //loggedInBusiness: null,
};
  
const businessSlice = createSlice({
    name: 'business',
    initialState,
    reducers: {
      // Actions for fetching business info
      businessRequest: (state) => {
        state.loading = true;
      },
      businessSuccess: (state, action) => {
        state.loading = false;
        state.businessInfo = action.payload;
      },
      businessFailure: (state, action) => {
        state.loading = false;
        state.error = action.payload;
      },

      // Action for business logout
      logoutBusiness: (state) => {
        state.businessInfo = null;
      },
    },

});
  
// Export actions and reducer
export const { 
  businessRequest, 
  businessSuccess, 
  businessFailure,
  logoutBusiness
} = businessSlice.actions;

export default businessSlice.reducer;