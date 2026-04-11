import { getSession } from "./auth"
import { hasPermission, Permission } from "./permissions"

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * Higher-order utility to wrap server actions with a standardized security check.
 * Use this to ensure all admin actions are protected by the same session/RBAC logic.
 */
export async function withAdminAccess<T>(
  requiredPermission: Permission | Permission[],
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const session = await getSession()
    
    if (!session) {
      return { success: false, error: "Unauthorized: Please log in." }
    }

    if (!hasPermission(session.user.role?.permissions || null, requiredPermission)) {
      return { success: false, error: "Access Denied: You do not have the required permissions." }
    }

    const data = await action()
    return { success: true, data }
  } catch (error: any) {
    console.error("ADMIN_ACTION_ERROR:", error)
    return { success: false, error: error.message || "An unexpected system error occurred." }
  }
}
