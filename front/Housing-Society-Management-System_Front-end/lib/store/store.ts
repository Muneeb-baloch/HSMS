import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// ── RTK Query APIs (only those actually used in components) ──
import { announcementApi } from "../API/announcementApi";
import { plotApi } from "../API/plotApi";

// ── Redux Slices ──
import announcementCategoryReducer from "./slices/announcementCategorySlice";
import { announcementSlice } from "./slices/announcementSlice";
import applicationReducer from "./slices/applicationSlice";
import authReducer from "./slices/authSlice";
import citySlice from "./slices/citySlice";
import complaintCategoryReducer from "./slices/complaintCategorySlice";
import billInfoReducer from "./slices/billInfoSlice";
import billTypeReducer from "./slices/billTypeSlice";
import complaintReducer from "./slices/complaintSlice";
import defaulterReducer from "./slices/defaulterSlice";
import fileReducer from "./slices/fileSlice";
import registryReducer from "./slices/registrySlice";
import installmentCategoryReducer from "./slices/installmentCategorySlice";
import installmentPlanDetailReducer from "./slices/installmentPlanDetailSlice";
import installmentPlanReducer from "./slices/installmentPlanSlice";
import installmentReducer from "./slices/installmentSlice";
import memberReducer from "./slices/memberSlice";
import nomineeReducer from "./slices/nomineeSlice";
import paymentModeReducer from "./slices/paymentModeSlice";
import permissionReducer from "./slices/permissionSlice";
import plotBlockReducer from "./slices/plotblockSlice";
import plotCategoryReducer from "./slices/plotcategorySlice";
import plotSizeReducer from "./slices/plotsizeSlice";
import plotReducer from "./slices/plotSlice";
import plotTypeReducer from "./slices/plottypeSlice";
import projectReducer from "./slices/projectSlice";
import salesStatusReducer from "./slices/salesStatusSlice";
import srApplicationTypeReducer from "./slices/srApplicationTypeSlice";
import srDevStatusReducer from "./slices/srDevStatusSlice";
import stateSlice from "./slices/stateSlice";
import statusSlice from "./slices/statusSlice";
import transferReducer from "./slices/transferSlice";
import transferTypeSlice from "./slices/transferTypeSlice";
import uiReducer from "./slices/uiSlice";
import uploadReducer from "./slices/uploadSlice";
import userPermissionReducer from "./slices/userpermissionSlice";
import userRoleReducer from "./slices/userroleSlice";
import userStaffReducer from "./slices/userStaffSlice";
import visitorReducer from "./slices/visitorSlice";
import facilityReducer from "./slices/facilitySlice";
import facilityBookingReducer from "./slices/facilityBookingSlice";
import societyReducer from "./slices/societySlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import workflowReducer from "./slices/workflowSlice";
import customFormReducer from "./slices/customFormSlice";
import privacyReducer from "./slices/privacySlice";
import aiReducer from "./slices/aiSlice";
import vendorReducer from "./slices/vendorSlice";
import attendanceReducer from "./slices/attendanceSlice";
import gamificationReducer from "./slices/gamificationSlice";
import plraReducer from "./slices/plraSlice";
import paymentGatewayReducer from "./slices/paymentGatewaySlice";
import smsReducer from "./slices/smsSlice";
import meetingReducer from "./slices/meetingSlice";
import pollReducer from "./slices/pollSlice";
import emergencyReducer from "./slices/emergencySlice";
import parkingReducer from "./slices/parkingSlice";
import marketplaceReducer from "./slices/marketplaceSlice";
import forumReducer from "./slices/forumSlice";
import staffRegistryReducer from "./slices/staffRegistrySlice";
import maintenanceRequestReducer from "./slices/maintenanceRequestSlice";
import gatePassReducer from "./slices/gatePassSlice";

export const store = configureStore({
  reducer: {
    // ── App state slices ──
    auth: authReducer,
    ui: uiReducer,
    upload: uploadReducer,

    // ── Domain slices ──
    announcementCategories: announcementCategoryReducer,
    announcements: announcementSlice.reducer,
    applications: applicationReducer,
    attendance: attendanceReducer,
    ai: aiReducer,
    bills: billInfoReducer,
    billTypes: billTypeReducer,
    cities: citySlice,
    complaintCategories: complaintCategoryReducer,
    complaints: complaintReducer,
    customForms: customFormReducer,
    defaulters: defaulterReducer,
    emergency: emergencyReducer,
    facilities: facilityReducer,
    facilityBookings: facilityBookingReducer,
    files: fileReducer,
    forum: forumReducer,
    gamification: gamificationReducer,
    gatePasses: gatePassReducer,
    installmentCategories: installmentCategoryReducer,
    installmentPlanDetails: installmentPlanDetailReducer,
    installmentPlans: installmentPlanReducer,
    installments: installmentReducer,
    maintenanceRequests: maintenanceRequestReducer,
    marketplace: marketplaceReducer,
    meetings: meetingReducer,
    members: memberReducer,
    nominees: nomineeReducer,
    parking: parkingReducer,
    paymentGateway: paymentGatewayReducer,
    paymentModes: paymentModeReducer,
    permissions: permissionReducer,
    plotBlocks: plotBlockReducer,
    plotCategories: plotCategoryReducer,
    plots: plotReducer,
    plotSizes: plotSizeReducer,
    plotTypes: plotTypeReducer,
    plra: plraReducer,
    polls: pollReducer,
    privacy: privacyReducer,
    projects: projectReducer,
    registries: registryReducer,
    salesStatus: salesStatusReducer,
    sms: smsReducer,
    societies: societyReducer,
    srApplicationTypes: srApplicationTypeReducer,
    srDevStatus: srDevStatusReducer,
    staffRegistry: staffRegistryReducer,
    states: stateSlice,
    status: statusSlice,
    subscriptions: subscriptionReducer,
    transfers: transferReducer,
    transferTypes: transferTypeSlice,
    userPermissions: userPermissionReducer,
    userRoles: userRoleReducer,
    userStaff: userStaffReducer,
    vendorManagement: vendorReducer,
    visitors: visitorReducer,
    workflows: workflowReducer,

    // ── RTK Query APIs (only used ones) ──
    [announcementApi.reducerPath]: announcementApi.reducer,
    [plotApi.reducerPath]: plotApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/setUser",
          "auth/setTokens",
          "plots/setFilters",
          "members/setMembers",
          "announcements/setFilters",
          "announcements/addAnnouncement",
          "announcements/updateAnnouncement",
        ],
        ignoredPaths: [
          "auth.user",
          "auth.tokens",
          "members.items",
          "members.selectedItem",
          "ui.modal.data",
        ],
      },
    }).concat(
      announcementApi.middleware,
      plotApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
