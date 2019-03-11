let sensors;
if (mpvuePlatform === 'wx') {
    sensors = require('./wx/sensorsdata');
}

if (mpvuePlatform === 'my') {
    sensors = require('./my/sensorsdata');
}

export default sensors;
