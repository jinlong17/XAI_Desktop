import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jinlong.xai.mobile",
  appName: "XAI",
  webDir: "../web/dist",
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 300,
    },
    StatusBar: {
      backgroundColor: "#111314",
      overlaysWebView: false,
    },
  },
};

export default config;
