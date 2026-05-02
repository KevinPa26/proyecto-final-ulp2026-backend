import { Inject } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { authConfig } from "../config/auth.config";
import * as bcrypt from 'bcrypt';

export class BcryptService {
    constructor(@Inject(authConfig.KEY) private atConfig: ConfigType<typeof authConfig>) {}

    async hashPassword(passwordSinHash: string) {
        return bcrypt.hash(passwordSinHash, this.atConfig.saltRounds)
    }

    async coomparePassword(passwordSinHash: string, passwordHash: string) {
        return bcrypt.compare(passwordSinHash, passwordHash)
    }
}