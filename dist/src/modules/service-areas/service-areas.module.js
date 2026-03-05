"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAreasModule = void 0;
const common_1 = require("@nestjs/common");
const service_areas_service_1 = require("./service-areas.service");
const service_areas_resolver_1 = require("./service-areas.resolver");
let ServiceAreasModule = class ServiceAreasModule {
};
exports.ServiceAreasModule = ServiceAreasModule;
exports.ServiceAreasModule = ServiceAreasModule = __decorate([
    (0, common_1.Module)({
        providers: [service_areas_service_1.ServiceAreasService, service_areas_resolver_1.ServiceAreasResolver],
        exports: [service_areas_service_1.ServiceAreasService],
    })
], ServiceAreasModule);
//# sourceMappingURL=service-areas.module.js.map