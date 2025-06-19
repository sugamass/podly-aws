/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/response.ts":
/*!*******************************!*\
  !*** ./src/utils/response.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.badRequestResponse = exports.notFoundResponse = exports.errorResponse = exports.successResponse = exports.createResponse = void 0;
const createResponse = (statusCode, data, headers) => {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(data),
    };
};
exports.createResponse = createResponse;
const successResponse = (data) => {
    return (0, exports.createResponse)(200, data);
};
exports.successResponse = successResponse;
const errorResponse = (message, statusCode = 500) => {
    return (0, exports.createResponse)(statusCode, {
        error: "Error",
        message,
    });
};
exports.errorResponse = errorResponse;
const notFoundResponse = (message = "Not Found") => {
    return (0, exports.createResponse)(404, {
        error: "Not Found",
        message,
    });
};
exports.notFoundResponse = notFoundResponse;
const badRequestResponse = (message) => {
    return (0, exports.createResponse)(400, {
        error: "Bad Request",
        message,
    });
};
exports.badRequestResponse = badRequestResponse;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************************!*\
  !*** ./src/handlers/hello.ts ***!
  \*******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handler = void 0;
const response_1 = __webpack_require__(/*! ../utils/response */ "./src/utils/response.ts");
const handler = async (event, context) => {
    console.log("Event:", JSON.stringify(event, null, 2));
    console.log("Context:", JSON.stringify(context, null, 2));
    const message = {
        message: "Hello from Podly Lambda!",
        timestamp: new Date().toISOString(),
        stage: process.env.STAGE,
        path: event.path,
        httpMethod: event.httpMethod,
    };
    return (0, response_1.successResponse)(message);
};
exports.handler = handler;

})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=hello.js.map