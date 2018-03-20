export const DEBUG = document.location.search.indexOf("debug") > -1;
export const PRODUCTION = process.env.NODE_ENV === "production";

export const API_ROOT = PRODUCTION ? "/api" : "//localhost:3005";

const WS_HOST = PRODUCTION ? document.location.host : "localhost:3005";
export const WEBSOCKET_ADDRESS = `ws://${WS_HOST}/api`;

export const DASHBOARD_TIMEOUT = 20000;
export const WHO_IS_THIS_TIMEOUT = 20000;
