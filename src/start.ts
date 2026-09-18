import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { consumeLastCapturedError } from "./lib/error-capture";

const errorMiddleware = createMiddleware({
  onError: async ({ error, request }) => {
    const captured = consumeLastCapturedError();
    return renderErrorPage({
      error: captured ?? error,
      request,
    });
  },
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
