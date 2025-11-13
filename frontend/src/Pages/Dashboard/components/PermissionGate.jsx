import { useUserStore } from "@/Store/useUserStore";

export function PermissionGate({ permission, children }) {
  const hasPermission = useUserStore((state) => state.hasPermission);

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}
