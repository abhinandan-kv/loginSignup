/**
 * Capture user's IP and User-Agent from request and save in IpTable.
 * @param {Object} req - Express request object
 * @param {number} userId - ID of the logged-in user
 */
export async function logUserLogin(req, userId) {
  try {
    if (!userId) throw new Error("userId is required");

    // Extract IP (works behind proxy and with Express)
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || "Unknown";

    // Extract user-agent (browser/device info)
    const userAgent = req.headers["user-agent"] || "Unknown";

    console.log(`🟢 Saved login info for user ${userId}: ${ip} (${userAgent})`);

    return { ip, userAgent };
  } catch (err) {
    console.error("Error saving IP/User-Agent info:", err);
  }
}
