import path from "node:path";

export const config: Record<string, unknown> = {
  token: 'token value in config.js',
  uploadPath: path.resolve(__dirname, './uploads'),
};