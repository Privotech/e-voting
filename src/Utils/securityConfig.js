const securityConfig = {
  isDemo: typeof window !== "undefined" && localStorage.getItem("inec_demo_mode") === "true",
  isProduction: process.env.NODE_ENV === "production",
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000,
  adminSessionTimeoutMs: 30 * 60 * 1000,
  voterSessionTimeoutMs: 2 * 60 * 60 * 1000,
};

export function setDemoMode(enabled) {
  try {
    if (enabled) {
      localStorage.setItem("inec_demo_mode", "true");
    } else {
      localStorage.removeItem("inec_demo_mode");
    }
  } catch {
    // storage unavailable
  }
  securityConfig.isDemo = enabled;
}

export function getDemoMode() {
  return securityConfig.isDemo;
}

export default securityConfig;
