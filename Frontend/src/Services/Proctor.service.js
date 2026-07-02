export const getPreJoinEnvironmentCheck = async () => {
  const checkedAt = new Date().toISOString();
  const baseCheck = {
    checkedAt,
    browser: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    },
    monitors: {
      status: "unsupported",
      count: null,
      isExtended: typeof window.screen.isExtended === "boolean" ? window.screen.isExtended : null,
      details: [],
      message: "Detailed monitor detection is not supported by this browser.",
    },
  };

  if (typeof window.getScreenDetails !== "function") {
    return baseCheck;
  }

  try {
    const screenDetails = await window.getScreenDetails();
    return {
      ...baseCheck,
      monitors: {
        status: "available",
        count: screenDetails.screens.length,
        isExtended: screenDetails.screens.length > 1,
        details: screenDetails.screens.map((screen) => ({
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          isPrimary: screen.isPrimary,
          isInternal: screen.isInternal,
          label: screen.label || "Unnamed display",
        })),
        message: screenDetails.screens.length > 1
          ? "Multiple displays detected."
          : "Single display detected.",
      },
    };
  } catch (error) {
    return {
      ...baseCheck,
      monitors: {
        ...baseCheck.monitors,
        status: "permission-denied",
        message: "Monitor permission was denied or unavailable.",
        error: error?.message || "Unable to read monitor details",
      },
    };
  }
};
