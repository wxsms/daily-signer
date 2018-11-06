"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const index_1 = require("./modules/jd/index");
const index_2 = require("./modules/v2ex/index");
const browser_1 = require("./utils/browser");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // make sure temp dir exist
        const tempDir = (path.join(__dirname, '../temp'));
        !fs.existsSync(tempDir) && fs.mkdirSync(tempDir);
        yield browser_1.initBrowser();
        // start jobs
        yield index_1.default();
        yield index_2.default();
    });
}
main()
    .then(() => {
    console.log('done.');
    process.exit(0);
})
    .catch(err => {
    console.error(err);
    process.exit(1);
});
