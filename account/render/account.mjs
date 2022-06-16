import { formatToDollar } from "/utils.mjs";

export function renderAccount(account) {
    formatToDollar(document.getElementById('available-cash'), account.securitiesAccount.currentBalances.cashBalance);
    formatToDollar(document.getElementById('available-margin'), account.securitiesAccount.projectedBalances.stockBuyingPower);
    formatToDollar(document.getElementById('margin-balance'), account.securitiesAccount.currentBalances.marginBalance);
    formatToDollar(document.getElementById('daily-interest'), account.securitiesAccount.currentBalances.marginBalance * interestRate(-account.securitiesAccount.currentBalances.marginBalance) / 360);
    formatToDollar(document.getElementById('margin-equity'), account.securitiesAccount.currentBalances.equity);
    formatToDollar(document.getElementById('margin-requirement'), -account.securitiesAccount.currentBalances.maintenanceRequirement);
}

function interestRate(loan) {
    if (loan >= 1000000) {
        return 0.07;
    } else if (loan >= 250000) {
        return 0.075;
    } else if (loan >= 100000) {
        return 0.0775;
    } else if (loan >= 50000) {
        return 0.08;
    } else if (loan >= 25000) {
        return 0.09;
    } else if (loan >= 10000) {
        return 0.0925;
    } else if (loan >= 0) {
        return 0.095;
    }
}

function interestRate2(loan) {
    if (0 <= loan && loan < 10000) {
        return 0.095;
    } else if (10000 <= loan && loan < 25000) {
        return 0.0925;
    } else if (25000 <= loan && loan < 50000) {
        return 0.09;
    } else if (50000 <= loan && loan < 100000) {
        return 0.08;
    } else if (100000 <= loan && loan < 250000) {
        return 0.0775;
    } else if (250000 <= loan && loan < 1000000) {
        return 0.075;
    } else {
        return 0.075;
    }
}