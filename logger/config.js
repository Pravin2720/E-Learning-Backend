//
// ──────────────────────────────────────────────────────── I ──────────
//   :::::: P A T T E R N S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────
//

const requestTokens = {
  rid: (event) => (event.context.req ? event.context.req.rid : event.context.res && event.context.res.req.rid),
  reqBody: (event) =>
    event.context.req
      ? JSON.stringify(event.context.req.body)
      : event.context.res && JSON.stringify(event.context.res.req.body),
  reqHeaders: (event) =>
    event.context.res && JSON.stringify(event.context.req ? event.context.req.headers : event.context.res.req.headers),
  resBody: (event) => event.context.res && JSON.stringify(event.context.res.body),
  resHeaders: (event) => event.context.res && JSON.stringify(event.context.res.headers),
};

const consolePattern = {
  type: "pattern",
  pattern: "%[%d{yyyy-MM-ddThh:mm:ss.SSSZO}%]|%h|%[%p%]|%c|%[%l%]|%[%o%]>>>%m",
};

const consoleRequestPattern = {
  type: "pattern",
  pattern: "%[%d{yyyy-MM-ddThh:mm:ss.SSSZO}%]|%h|%[%p%]|%c|%[%x{rid}%]>>>%m%n%[QB%] %x{reqBody}%n%[QH%] %x{reqHeaders}",
  // "%[%d{yyyy-MM-ddThh:mm:ss.SSSZO}%]|%h|%[%p%]|%c|%[%x{rid}%]>>>%m%n%[QB%] %x{reqBody}%n%[QH%] %x{reqHeaders}%n%[SB%] %x{resBody}%n%[SH%] %x{resHeaders}",
  tokens: requestTokens,
};

const filePattern = {
  type: "pattern",
  pattern: "%d{yyyy-MM-ddThh:mm:ss.SSSZO}|%h|%p|%c|%l|%o>>>%m",
};

const fileRequestPattern = {
  type: "pattern",
  pattern: "%d{yyyy-MM-ddThh:mm:ss.SSSZO}|%h|%p|%c|%x{rid}>>>%m%n<QB>%x{reqBody}</QB>%n<QH>%x{reqHeaders}</QH>",
  // "%d{yyyy-MM-ddThh:mm:ss.SSSZO}|%h|%p|%c|%x{rid}>>>%m%n<QB>%x{reqBody}</QB>%n<QH>%x{reqHeaders}</QH>%n<SB>%x{resBody}</SB>%n<SH>%x{resHeaders}</SH>",
  tokens: requestTokens,
};

//
// ────────────────────────────────────────────────────────── I ──────────
//   :::::: A P P E N D E R S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────
//

const datefileCommonOpts = {
  keepFileExt: true,
  numBackups: 90,
  compress: false,
};

//
// ─── CONSOLE ────────────────────────────────────────────────────────────────────
//

const consoleAppender = {
  type: "console",
  layout: consolePattern,
};
const consoleRequestAppender = {
  type: "console",
  layout: consoleRequestPattern,
};

//
// ─── FILE ───────────────────────────────────────────────────────────────────
//

const combinedAppender = {
  type: "dateFile",
  filename: "logs/combined.log",
  layout: filePattern,
  ...datefileCommonOpts,
};

const combinedRequestAppender = {
  type: "dateFile",
  filename: "logs/combined.log",
  layout: fileRequestPattern,
  ...datefileCommonOpts,
};

const tasksAppender = {
  type: "dateFile",
  filename: "logs/tasks.log",
  layout: filePattern,
  ...datefileCommonOpts,
};

const categoryAppender = {
  type: "multiFile",
  base: "logs/categories/",
  property: "categoryName",
  extension: ".log",
  maxLogSize: (1024 * 1024 * 1024).toString(),
  backups: 99,
  compress: false,
  layout: filePattern,
};

//
// ─── HTTP REQUESTS ──────────────────────────────────────────────────────────────
//

const requestAppender = {
  type: "dateFile",
  filename: "logs/requests.log",
  layout: fileRequestPattern,
  ...datefileCommonOpts,
};

const thinkificAppender = {
  type: "dateFile",
  filename: "logs/thinkific.log",
  layout: fileRequestPattern,
  ...datefileCommonOpts,
};

const razorpayAppender = {
  type: "dateFile",
  filename: "logs/razorpay.log",
  layout: fileRequestPattern,
  ...datefileCommonOpts,
};

const healthCheckerAppender = {
  type: "dateFile",
  filename: "logs/health_checker.log",
  layout: fileRequestPattern,
  ...datefileCommonOpts,
};

//
// ──────────────────────────────────────────────────── I ──────────
//   :::::: C O N F I G : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────
//

export const log_config = {
  pm2: true,
  appenders: {
    console: consoleAppender,
    consoleRequest: consoleRequestAppender,
    combined: combinedAppender,
    combinedRequest: combinedRequestAppender,
    request: requestAppender,
    thinkific: thinkificAppender,
    razorpay: razorpayAppender,
    tasks: tasksAppender,
    category: categoryAppender,
    healthChecker: healthCheckerAppender,
  },
  categories: {
    default: {
      appenders: ["console", "combined", "category"],
      level: "ALL",
      enableCallStack: true,
    },
    tasks: {
      appenders: ["console", "combined", "tasks"],
      level: "ALL",
      enableCallStack: true,
    },
    http: {
      appenders: ["consoleRequest", "combinedRequest", "request"],
      level: "ALL",
      enableCallStack: true,
    },
    thinkifichttp: {
      appenders: ["consoleRequest", "combinedRequest", "request", "thinkific"],
      level: "ALL",
      enableCallStack: true,
    },
    razorpayhttp: {
      appenders: ["consoleRequest", "combinedRequest", "request", "razorpay"],
      level: "ALL",
      enableCallStack: true,
    },
    healthcheckerhttp: {
      appenders: ["consoleRequest", "healthChecker"],
      level: "ALL",
      enableCallStack: true,
    },
  },
};

//
// ─── MIDDLEWARE OPTIONS ─────────────────────────────────────────────────────────
//

export const middleware_options = {
  level: "auto",
  context: true,
  format: (req, res, format) => {
    if (!!req.headers["user-agent"] && req.headers["user-agent"].toLowerCase().indexOf("razorpay") >= 0) {
      return format(
        `razorpay|:remote-addr|:method :url HTTP/:http-version|:status|:content-length|":referrer"|":user-agent"`,
      );
    }
    return format(
      `public|:remote-addr|:method :url HTTP/:http-version|:status|:content-length|":referrer"|":user-agent"`,
    );
  },
};
