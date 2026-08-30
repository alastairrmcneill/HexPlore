const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = __dirname + '/photo-location-scanner';
const PODFILE_MARKER = "pod 'PhotoLocationScanner'";

/**
 * Copies the hand-written PhotoLocationScanner native module (fast PHAsset
 * location scanning) into ios/Modules and links it as a local Podfile pod.
 * Source of truth lives in plugins/photo-location-scanner/ — never edit the
 * copies under ios/Modules directly, they're overwritten on every prebuild.
 */
function withPhotoLocationScannerFiles(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const destDir = path.join(config.modRequest.platformProjectRoot, 'Modules');
      fs.mkdirSync(destDir, { recursive: true });
      for (const file of fs.readdirSync(SOURCE_DIR)) {
        fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(destDir, file));
      }
      return config;
    },
  ]);
}

function withPhotoLocationScannerPodfile(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (!contents.includes(PODFILE_MARKER)) {
        const anchor = 'config = use_native_modules!(config_command)';
        const injected =
          `${anchor}\n\n` +
          `  # Local native module — fast photo location scanning via PHAsset\n` +
          `  pod 'PhotoLocationScanner', :path => './Modules'`;

        if (!contents.includes(anchor)) {
          throw new Error(
            'withPhotoLocationScanner: could not find Podfile anchor to inject the local pod. ' +
            'The Podfile template may have changed — update plugins/withPhotoLocationScanner.js.',
          );
        }
        contents = contents.replace(anchor, injected);
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    },
  ]);
}

module.exports = function withPhotoLocationScanner(config) {
  config = withPhotoLocationScannerFiles(config);
  config = withPhotoLocationScannerPodfile(config);
  return config;
};
