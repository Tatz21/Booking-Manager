"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRefreshResponseDto = exports.AuthResponseDto = exports.BusinessSummaryDto = exports.UserSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserSummaryDto {
}
exports.UserSummaryDto = UserSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.owner@example.com' }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OWNER' }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "role", void 0);
class BusinessSummaryDto {
}
exports.BusinessSummaryDto = BusinessSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], BusinessSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apex Barber Studio' }),
    __metadata("design:type", String)
], BusinessSummaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'apex-barber-studio-7a8b' }),
    __metadata("design:type", String)
], BusinessSummaryDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Asia/Kolkata' }),
    __metadata("design:type", String)
], BusinessSummaryDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], BusinessSummaryDto.prototype, "currency", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'd3b07384d113edec49eaa6238ad5ff00...' }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 900, description: 'Access token expiration in seconds (15 minutes)' }),
    __metadata("design:type", Number)
], AuthResponseDto.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserSummaryDto }),
    __metadata("design:type", UserSummaryDto)
], AuthResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessSummaryDto }),
    __metadata("design:type", BusinessSummaryDto)
], AuthResponseDto.prototype, "business", void 0);
class TokenRefreshResponseDto {
}
exports.TokenRefreshResponseDto = TokenRefreshResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], TokenRefreshResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'd3b07384d113edec49eaa6238ad5ff00...' }),
    __metadata("design:type", String)
], TokenRefreshResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 900 }),
    __metadata("design:type", Number)
], TokenRefreshResponseDto.prototype, "expiresIn", void 0);
//# sourceMappingURL=auth-response.dto.js.map