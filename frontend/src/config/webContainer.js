import { WebContainer } from "@webcontainer/api";

let webContainerInstance = null;

export const getWebContainer = async () => {

  if (webContainerInstance) {
    return webContainerInstance;
  }

  try {

    webContainerInstance = await WebContainer.boot({
      workdirName: "project"
    });

    return webContainerInstance;

  } catch (error) {

    console.error("WebContainer boot failed:", error);

    // reset instance so next call retries boot
    webContainerInstance = null;

    throw error;
  }
};