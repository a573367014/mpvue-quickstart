module.exports = {
    "helpers": {
        "if_or": function (v1, v2, options) {
            if (v1 || v2) {
                return options.fn(this);
            }

            return options.inverse(this);
        }
    },
    "prompts": {
        "name": {
            "type": "string",
            "required": true,
            "message": "Project name"
        },
        "appid": {
            "type": "string",
            "required": false,
            "message": "wxmp appid",
            "default": "touristappid"
        },
        "description": {
            "type": "string",
            "required": false,
            "message": "Project description",
            "default": "A Mpvue project"
        },
        "author": {
            "type": "string",
            "message": "Author"
        },
        // "build": {
        //   "type": "list",
        //   "message": "Vue build",
        //   "choices": [
        //     // {
        //     //   "name": "Runtime + Compiler: recommended for most users",
        //     //   "value": "standalone",
        //     //   "short": "standalone"
        //     // },
        //     {
        //       "name": "Runtime-only: no custom render function, only can compile template in *.vue",
        //       "value": "runtime",
        //       "short": "runtime"
        //     }
        //   ]
        // },
        "lint": {
            "type": "confirm",
            "message": "Use ESLint to lint your code?"
        },
        "test": {
            "type": "confirm",
            "message": "Use Jest to check your code?"
        }
    },
    "filters": {
        ".eslintrc.js": "lint",
        ".eslintignore": "lint",
        "test/**/*": "test"
    },
    // "completeMessage": "To get started:\n\n  {{^inPlace}}cd {{destDirName}}\n  {{/inPlace}}npm install\n  npm run dev\n\nDocumentation can be found at https://vuejs-templates.github.io/webpack"
    "completeMessage": "To get started:\n\n  {{^inPlace}}cd {{destDirName}}\n  {{/inPlace}}npm install\n  npm run dev\n\nDocumentation can be found at http://mpvue.com"
};
