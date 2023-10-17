const axios = require("axios");

class RobloxUser {
    constructor(roblosecurityCookie, userId, username, displayName) {
        this.roblosecurityCookie = roblosecurityCookie;
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
    }

    async doAuthorizedRequest(url) {
        return (await axios.get(url, {
            headers: {
                Cookie: `.ROBLOSECURITY=${this.roblosecurityCookie}`,
            },
        })).data;
    }

    static async register(roblosecurityCookie) {
        const { data } = await axios.get("https://users.roblox.com/v1/users/authenticated", {
            headers: {
                Cookie: `.ROBLOSECURITY=${roblosecurityCookie}`,
            },
        });

        return new RobloxUser(roblosecurityCookie, data.id, data.name, data.displayName);
    }

    async getAccountCreationDate() {
        const { created } = await this.doAuthorizedRequest(`https://users.roblox.com/v1/users/${this.userId}`);

        return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "long" }).format(
            new Date(created),
        );
    }

    async getAccountPremiumStatus() {
        try {
            await this.doAuthorizedRequest(
                `https://premiumfeatures.roblox.com/v1/users/${this.userId}/subscriptions`
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    async getAccount2FAStatus() {
        const { twoStepVerificationEnabled } = await this.doAuthorizedRequest(
            `https://twostepverification.roblox.com/v1/metadata`
        );
        return twoStepVerificationEnabled;
    }

    async getAccountPinStatus() {
        const { isEnabled } = await this.doAuthorizedRequest(
            `https://auth.roblox.com/v1/account/pin`
        );
        return isEnabled;
    }

    async getAccountBalance() {
        const { robux } = await this.doAuthorizedRequest(
            `https://economy.roblox.com/v1/users/${this.userId}/currency`
        );
        return robux;
    }

    async getUserData() {
        const creationDate = await this.getAccountCreationDate();
        const premiumStatus = await this.getAccountPremiumStatus();
        const twoFAStatus = await this.getAccount2FAStatus();
        const pinStatus = await this.getAccountPinStatus();
        const accountBalance = await this.getAccountBalance();

        return {
            username: this.username,
            uid: this.userId,
            displayName: this.displayName,
            avatarUrl: await this.getAccountBodyShot(),
            createdAt: creationDate,
            country: await this.getAccountCountry(),
            balance: accountBalance,
            isTwoStepVerificationEnabled: twoFAStatus,
            isPinEnabled: pinStatus,
            isPremium: premiumStatus,
            creditbalance: await this.getAccountCreditBalance(),
            rap: await this.getAccountRAP(this.userId),
        };
    }

    async getAccountBodyShot() {
        const { data } = await this.doAuthorizedRequest(
            `https://thumbnails.roblox.com/v1/users/avatar?userIds=${
                this.userId
            }&size=720x720&format=Png&isCircular=false`
        );
        return data[0].imageUrl;
    }

    async getAccountCountry() {
        const { countryName } = await this.doAuthorizedRequest(
            "https://www.roblox.com/account/settings/account-country"
        );
        return countryName;
    }

    async getAccountCreditBalance() {
        const { balance } = await this.doAuthorizedRequest(
            "https://billing.roblox.com/v1/credit"
        );
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });
        return formatter.format(balance);
    }

    async getAccountRAP(userId) {
        let calculatedRap = 0;
        let nextPageCursor = "";

        while (nextPageCursor !== null) {
            const inventoryPage = await this.doAuthorizedRequest(
                `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100&cursor=${nextPageCursor}`
            );

            calculatedRap += inventoryPage.data.reduce(
                (rap, item) => rap + item.recentAveragePrice,
                0
            );
            nextPageCursor = inventoryPage.nextPageCursor;
        }

        return calculatedRap;
    }
}

module.exports = {
    RobloxUser,
};
