export const STATUS_CODES = {
  OK: { code: 200, description: "OK - The request has succeeded." },
  Created: { code: 201, description: "Created - The request has been fulfilled and resulted in a new resource being created." },
  NoContent: { code: 204, description: "No Content - The server successfully processed the request, but is not returning any content." },
  BadRequest: { code: 400, description: "Bad Request - The server could not understand the request due to invalid syntax." },
  Unauthorized: { code: 401, description: "Unauthorized - The client must authenticate itself to get the requested response." },
  Forbidden: { code: 403, description: "Forbidden - The client does not have access rights to the content." },
  NotFound: { code: 404, description: "Not Found - The server can not find the requested resource." },
  MethodNotAllowed: {
    code: 405,
    description: "Method Not Allowed - The request method is known by the server but is not supported by the target resource.",
  },
  Conflict: { code: 409, description: "Conflict - The request conflicts with the current state of the server." },
  InternalServerError: { code: 500, description: "Internal Server Error - The server has encountered a situation it doesn't know how to handle." },
  BadGateway: {
    code: 502,
    description: "Bad Gateway - The server, while acting as a gateway or proxy, received an invalid response from the upstream server.",
  },
  ServiceUnavailable: { code: 503, description: "Service Unavailable - The server is not ready to handle the request." },
  GatewayTimeout: {
    code: 504,
    description: "Gateway Timeout - The server was acting as a gateway and did not receive a timely response from the upstream server.",
  },
};
