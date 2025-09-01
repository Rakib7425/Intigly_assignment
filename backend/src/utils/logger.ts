export const logMessage = (message: string, data?: any): void => {
  console.log(message, data ? data : "");
};

export const logError = (message: string, error: any): void => {
  console.error(message, error);
};
