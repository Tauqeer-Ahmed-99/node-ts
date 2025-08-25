export enum Permission {
  ViewAdminPanel = "view-admin-panel",
  ViewDashboard = "view-dashboard",
  ViewOrders = "view-orders",
  ManageOrders = "manage-orders",
  InspectReturnsAndRefunds = "inspect-rnr",
  ViewSystemConfig = "view-system-config",
  ManageSystemConfig = "manage-system-config",
  ManageUsers = "widgets:users-table:manage",
}

export interface User {
  userId: string;
  sessionId: string;
  orgId: string;
  role: string;
  permissions: Permission[];
  featureFlags: string[];
  expiresAt: number;
  issuedAt: number;
}

export type AuthUser = User | null;
