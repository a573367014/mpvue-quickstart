import common from './common';
import storage from './storage';
import validate from './validate';
import network from './network';
import dom from './dom';
import ui from './ui';
import writeFile from './writeFile';

export default {
    ...ui,
    ...network,
    ...dom,
    ...common,
    storage,
    validate,
    writeFile
};
