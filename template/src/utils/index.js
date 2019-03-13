import common from './common';
import storage from './storage';
import validate from './validate';
import network from './network';
import dom from './dom';
import ui from './ui';

export default {
    ...ui,
    ...network,
    ...dom,
    ...common,
    storage,
    validate
};
