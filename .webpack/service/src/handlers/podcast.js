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
/*!*********************************!*\
  !*** ./src/handlers/podcast.ts ***!
  \*********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.listPodcasts = exports.getPodcast = exports.createPodcast = void 0;
const response_1 = __webpack_require__(/*! ../utils/response */ "./src/utils/response.ts");
// インメモリストレージ（本番環境ではDynamoDBなどを使用）
const podcasts = [];
const createPodcast = async (event, context) => {
    try {
        if (!event.body) {
            return (0, response_1.badRequestResponse)("Request body is required");
        }
        const request = JSON.parse(event.body);
        if (!request.title || !request.description || !request.category) {
            return (0, response_1.badRequestResponse)("title, description, and category are required");
        }
        const newPodcast = {
            id: Math.random().toString(36).substr(2, 9),
            title: request.title,
            description: request.description,
            category: request.category,
            duration: request.duration,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        podcasts.push(newPodcast);
        return (0, response_1.successResponse)(newPodcast);
    }
    catch (error) {
        console.error("Error creating podcast:", error);
        return (0, response_1.errorResponse)("Failed to create podcast");
    }
};
exports.createPodcast = createPodcast;
const getPodcast = async (event, context) => {
    try {
        const podcastId = event.pathParameters?.id;
        if (!podcastId) {
            return (0, response_1.badRequestResponse)("Podcast ID is required");
        }
        const podcast = podcasts.find((p) => p.id === podcastId);
        if (!podcast) {
            return (0, response_1.notFoundResponse)("Podcast not found");
        }
        return (0, response_1.successResponse)(podcast);
    }
    catch (error) {
        console.error("Error getting podcast:", error);
        return (0, response_1.errorResponse)("Failed to get podcast");
    }
};
exports.getPodcast = getPodcast;
const listPodcasts = async (event, context) => {
    try {
        const { category } = event.queryStringParameters || {};
        let filteredPodcasts = [...podcasts];
        if (category) {
            filteredPodcasts = podcasts.filter((p) => p.category === category);
        }
        return (0, response_1.successResponse)({
            podcasts: filteredPodcasts,
            count: filteredPodcasts.length,
        });
    }
    catch (error) {
        console.error("Error listing podcasts:", error);
        return (0, response_1.errorResponse)("Failed to list podcasts");
    }
};
exports.listPodcasts = listPodcasts;

})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=podcast.js.map