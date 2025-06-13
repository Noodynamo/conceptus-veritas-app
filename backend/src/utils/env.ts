/**
 * Gets an environment variable or returns a default value
 * 
 * @param key - Environment variable name
 * @param defaultValue - Default value to use if environment variable is not set
 * @returns The environment variable value or the default value
 */
export const getEnvOrDefault = (key: string, defaultValue: string): string => {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}; 