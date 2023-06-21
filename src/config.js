// Set defaults for env and service name
if (process.env["APPCFG_env"]) {
  process.env["NODE_ENV"] = process.env["APPCFG_env"];
  process.env["NODE_CONFIG_DIR"] = "/etc/service/config";
} else {
  process.env["APPCFG_env"] = "local";
  process.env["NODE_ENV"] = "local";
  process.env["NODE_CONFIG_DIR"] = "../config"
}
if (!process.env["APPCFG_name"]) {
  process.env["APPCFG_name"] = require(__dirname + "/../package.json").name;
}
const configDir = process.env["NODE_CONFIG_DIR"];

// Load nconf library and set configuration loading priorirty
var nconf = require('nconf');
var nconfYaml = require('nconf-yaml');
nconf
  .argv()
  .env({
    separator: "_",
    parseValues: true,
    transform: function(obj) {
      var splitKey = obj.key.split("_");
      if (splitKey[0] != "APPCFG") {
        return false
      }
      return {
        key: splitKey.slice(1).join("_"),
        value: obj.value
      }
    }
  });

// Load env-based config file first and then base config file
const env = nconf.get("env");
if (env != "local") {
  nconf.add(env, {
    type: "file",
    file: configDir + "/" + env + ".yaml",
    format: nconfYaml
  })
}
nconf.add("base", {
  type: "file",
  file: configDir + "/base.yaml",
  format: nconfYaml
});

module.exports = nconf
