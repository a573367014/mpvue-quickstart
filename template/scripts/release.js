/**
 * release script
 */
// env
require('../env');

const platform = process.argv[process.argv.length - 1] || 'wx';
const path = require('path');
const chalk = require('chalk');
const logSymbols = require('log-symbols');

const fsp = require('fs-extra');
const Promise = require('bluebird');
const spawn = require('child-process-promise').spawn;

const getPaths = require('../webpack.paths');
const oss = require('../services/oss');
const loggers = require('../services/logger').loggers;
const info = loggers.INFO;
const warn = loggers.WARN;

const {DIST: distBasePath} = getPaths('default', platform);
const manifestsMapPath = path.join(__dirname, '../manifests-map.json');

const IO_MAX_CONCURRENCY = require('os').cpus().length;
const CDN_BUCKET = process.env.CDN_BUCKET;
const manifestsMap = {};

const hasSecretKey = !!process.env.OSS_SECRET_KEY;

const filterChangedModules = (modules) => {
    return modules.filter(module => {
        return !!module.syncFiles.length;
    });
};

if (!hasSecretKey) {
    console.error(logSymbols.error, chalk.red(`缺少上传必要配置"OSS_SECRET_KEY", 请找相关负责人获取`));
    return;
}

// Main
Promise.try(() => {
    info('Read last manifests map...');

    return fsp.readJSON(manifestsMapPath)
        .catch(err => {
            warn('Read last manifests map error:', err.message);

            return {};
        })
        .then(map => {
            Object.assign(manifestsMap, map);
        });
})
    .then(() => {
        info('Start building...');

        return spawn('npm', ['run', 'build:' + platform], {
            stdio: 'inherit'
        });
    })
    .then(() => {
        info('Read new manifests...');

        return Promise.try(() => {
            return ['default'];
        })
            .map(name => {
                const paths = getPaths(name);
                const module = {
                    name: name,
                    modulePath: paths.DIST,
                    manifestPath: paths.MANIFEST,
                    manifest: null,
                    removeFiles: [],
                    syncFiles: [],
                    paths: paths
                };

                console.log(module);

                return fsp.readJSON(paths.MANIFEST)
                    .catch(() => {
                        return null;
                    })
                    .then(manifest => {
                        module.manifest = manifest;

                        return module;
                    });
            })
            .filter(module => {
                return !!module.manifest;
            });
    })
    .map(module => {
        const oldManifest = manifestsMap[module.name];
        const removeFiles = module.removeFiles;
        const syncFiles = module.syncFiles;
        const manifest = module.manifest;

        if (oldManifest) {
            info(`[${module.name}] Check out-of-date files...`);

            Object.keys(oldManifest).forEach(name => {
                const oldDist = oldManifest[name];
                const dist = manifest[name];

                if (!dist || dist !== oldDist) {
                    removeFiles.push({
                        dist: oldDist,
                        src: name
                    });
                }
            });
        }

        info(`[${module.name}] Check new files...`);

        Object.keys(manifest).forEach(name => {
            const oldDist = oldManifest && oldManifest[name];
            const dist = manifest[name];

            if (!oldDist || dist !== oldDist) {
                syncFiles.push({
                    dist: dist,
                    src: name
                });
            }
        });

        return module;
    })
    .mapSeries(module => {
        info(`[${module.name}] Clear out-of-date files...`);

        return Promise.map(module.removeFiles, ({dist}) => {
            info(`[${module.name}] Remove file:`, dist);

            return fsp.remove(dist);
        }, {
            concurrency: IO_MAX_CONCURRENCY
        })
            .then(() => {
                return module;
            });
    })
    .mapSeries(module => {
        info(`[${module.name}] Sync new files...`);

        return Promise.map(module.syncFiles, ({dist}) => {
            const paths = module.paths;
            const distPath = path.join(paths.DIST, dist);
            const cdnDistPath = path.join(paths.ASSETS_PATH, dist);

            info(`[${module.name}] Sync file:`, dist, '->', cdnDistPath);

            return oss.upload(distPath, cdnDistPath, CDN_BUCKET);
        }, {
            concurrency: IO_MAX_CONCURRENCY
        })
            .then(() => {
                return module;
            });
    })
    .tap(modules => {
        const updatedModules = modules.filter(module => {
            return !!module.syncFiles.length;
        });

        if (!updatedModules.length) {
            return;
        }

        info('Updating manifests map...');

        updatedModules.forEach(module => {
            manifestsMap[module.name] = module.manifest;
        });

        return manifestsMap;
    })
    .tap(modules => {
        const changedModules = filterChangedModules(modules);
        if (!changedModules.length) {
            return;
        }

        info('Updating local manifests file...');

        return fsp.outputJSON(manifestsMapPath, manifestsMap);
    }).then(() => {
        info('remove miniprogram prohibited build dir');

        fsp.removeSync(path.join(distBasePath, 'img'));
    })
    .then(() => {
        info('😄 success. ^_^');
    })
    .catch(err => {
        // axios request error
        const response = err.response;
        if (response && response.data) {
            err.message += ': ' + response.data.message;
        }

        console.error(err);

        warn('😢', err.message);

        process.exit(1);
    });
