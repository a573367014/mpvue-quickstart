/**
 * check or install deps
 */

const fs = require('fs');
const spawn = require('child_process').spawn;

const info = function (...args) {
    console.log(...args);
};

const depsPath = './node_modules';

fs.access(depsPath, err => {
    if (!err) {
        info('Deps has inited.');

        return;
    }

    info('Start install deps...');

    const npmArgs = ['run', 'install-deps'];
    const cp = spawn('npm', npmArgs, {
        stdio: 'inherit'
    });

    cp.on('exit', code => {
        process.exit(code);
    });
});
