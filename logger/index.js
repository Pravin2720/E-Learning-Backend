import Log4js from "log4js";

import path from "path";
import { fileURLToPath } from "url";
import { assert } from "console";

function getLogger(url) {
  try {
    var full_path = fileURLToPath(url);
    var dir_path = path.dirname(full_path);
    var current_path = process.cwd();
    assert(dir_path.indexOf(current_path) >= 0);
    assert(full_path.indexOf(dir_path) >= 0);

    // var dirname = dir_path.slice(current_path.length).replaceAll("\\", "/");
    // var filename = full_path.slice(dir_path.length).replaceAll("\\", "/");
    var relativeURL = full_path.slice(current_path.length).replaceAll("\\", "/");

    return Log4js.getLogger(relativeURL);
  } catch (error) {
    return Log4js.getLogger(url);
  }
}

export default getLogger;
export { log_config, middleware_options } from "./config.js";
