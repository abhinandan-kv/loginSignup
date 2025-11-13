export function ProtectedBlock({ permission, children }) {
  const hasPermission = useUserStore((state) => state.hasPermission);
  const isAllowed = hasPermission(permission);

  return <div className={isAllowed ? "" : "opacity-50 pointer-events-none"}>{children}</div>;
}

// this will only be usable if their is a chance of privilage elevation. 