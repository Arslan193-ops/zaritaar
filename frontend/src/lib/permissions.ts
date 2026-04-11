export const PERMISSIONS = {
  // Global
  DASHBOARD_VIEW: "dashboard:view",
  
  // Products
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_EDIT: "products:edit",
  PRODUCTS_DELETE: "products:delete",

  // Categories
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_EDIT: "categories:edit",
  CATEGORIES_DELETE: "categories:delete",

  // Orders
  ORDERS_VIEW: "orders:view",
  ORDERS_EDIT: "orders:edit",
  ORDERS_DELETE: "orders:delete",

  // Users 
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",

  // Roles
  ROLES_VIEW: "roles:view",
  ROLES_CREATE: "roles:create",
  ROLES_EDIT: "roles:edit",
  ROLES_DELETE: "roles:delete",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT: "settings:edit",

  // Ads
  ADS_VIEW: "ads:view",
  ADS_EDIT: "ads:edit",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function hasPermission(userPermissions: string | null, requiredPermission: Permission | Permission[]): boolean {
  if (!userPermissions) return false;
  try {
    const perms: string[] = JSON.parse(userPermissions);
    
    // Super host rule
    if (perms.includes("*")) return true;

    // Allow providing an array of required permissions (OR logic)
    if (Array.isArray(requiredPermission)) {
       return requiredPermission.some(req => perms.includes(req));
    }

    // Exact string match
    return perms.includes(requiredPermission);
  } catch {
    return false;
  }
}
