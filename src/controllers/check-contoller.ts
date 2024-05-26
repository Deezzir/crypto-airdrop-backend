import * as common from "../common.js";
import userAirdropService from "../services/airdropuser-service.js";
import userPresaleService from "../services/presaleuser-service.js";
import dotenv from "dotenv";
dotenv.config();

class CheckController {
    constructor() {
        this.verifyAirdropRecords = this.verifyAirdropRecords.bind(this);
        this.verifyPresaleRecords = this.verifyPresaleRecords.bind(this);
        this.verify = this.verify.bind(this);
    }

    async verifyAirdropRecords(req: any, res: any, next: any) {
        const users = await userAirdropService.getAllUsers();
        for (const user of users) {
            const isValid = await userAirdropService.verify(user);
            if (!isValid.isValid) {
                common.error(`User ${user.wallet} | ${user.xUsername} | ${user.xPostLink} is not valid: ${isValid.errorMsg}`);
            }
            await common.sleep(50);
        }
    }

    async verifyPresaleRecords(req: any, res: any, next: any) {
        // Your implementation for presale records verification
    }

    async verify(req: any, res: any, next: any) {
        common.log("Check - Starting verification process...");
        await this.verifyAirdropRecords(req, res, next);
        await this.verifyPresaleRecords(req, res, next);
        common.log("Check - Verification process finished.");

        res.json({
            status: "ok",
        });
    }
}

export default new CheckController();