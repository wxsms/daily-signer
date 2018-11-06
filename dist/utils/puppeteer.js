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
function abortUselessRequests(page) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.setRequestInterception(true);
        page.on('request', request => {
            const type = request.resourceType();
            const useless = type === 'media' || type === 'image' || type === 'font' || type === 'stylesheet';
            useless ? request.abort() : request.continue();
        });
    });
}
exports.abortUselessRequests = abortUselessRequests;
