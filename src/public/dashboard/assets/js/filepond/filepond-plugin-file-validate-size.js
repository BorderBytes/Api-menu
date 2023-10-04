/*!
 * FilePondPluginFileValidateSize 2.2.8
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit https://pqina.nl/filepond/ for details.
 */ !function(e,i){"object"==typeof exports&&"undefined"!=typeof module?module.exports=i():"function"==typeof define&&define.amd?define(i):(e=e||self).FilePondPluginFileValidateSize=i()}(this,function(){"use strict";var e=function e(i){var E=i.addFilter,l=i.utils,I=l.Type,n=l.replaceInString,t=l.toNaturalFileSize;return E("ALLOW_HOPPER_ITEM",function(e,i){var E=i.query;if(!E("GET_ALLOW_FILE_SIZE_VALIDATION"))return!0;var l=E("GET_MAX_FILE_SIZE");if(null!==l&&e.size>l)return!1;var I=E("GET_MIN_FILE_SIZE");return null===I||!(e.size<I)}),E("LOAD_FILE",function(e,i){var E=i.query;return new Promise(function(i,l){if(!E("GET_ALLOW_FILE_SIZE_VALIDATION"))return i(e);var I=E("GET_FILE_VALIDATE_SIZE_FILTER");if(I&&!I(e))return i(e);var L=E("GET_MAX_FILE_SIZE");if(null!==L&&e.size>L){l({status:{main:E("GET_LABEL_MAX_FILE_SIZE_EXCEEDED"),sub:n(E("GET_LABEL_MAX_FILE_SIZE"),{filesize:t(L,".",E("GET_FILE_SIZE_BASE"),E("GET_FILE_SIZE_LABELS",E))})}});return}var a=E("GET_MIN_FILE_SIZE");if(null!==a&&e.size<a){l({status:{main:E("GET_LABEL_MIN_FILE_SIZE_EXCEEDED"),sub:n(E("GET_LABEL_MIN_FILE_SIZE"),{filesize:t(a,".",E("GET_FILE_SIZE_BASE"),E("GET_FILE_SIZE_LABELS",E))})}});return}var u=E("GET_MAX_TOTAL_FILE_SIZE");if(null!==u&&E("GET_ACTIVE_ITEMS").reduce(function(e,i){return e+i.fileSize},0)>u){l({status:{main:E("GET_LABEL_MAX_TOTAL_FILE_SIZE_EXCEEDED"),sub:n(E("GET_LABEL_MAX_TOTAL_FILE_SIZE"),{filesize:t(u,".",E("GET_FILE_SIZE_BASE"),E("GET_FILE_SIZE_LABELS",E))})}});return}i(e)})}),{options:{allowFileSizeValidation:[!0,I.BOOLEAN],maxFileSize:[null,I.INT],minFileSize:[null,I.INT],maxTotalFileSize:[null,I.INT],fileValidateSizeFilter:[null,I.FUNCTION],labelMinFileSizeExceeded:["File is too small",I.STRING],labelMinFileSize:["Minimum file size is {filesize}",I.STRING],labelMaxFileSizeExceeded:["File is too large",I.STRING],labelMaxFileSize:["Maximum file size is {filesize}",I.STRING],labelMaxTotalFileSizeExceeded:["Maximum total size exceeded",I.STRING],labelMaxTotalFileSize:["Maximum total file size is {filesize}",I.STRING]}}};return"undefined"!=typeof window&&void 0!==window.document&&document.dispatchEvent(new CustomEvent("FilePond:pluginloaded",{detail:e})),e});