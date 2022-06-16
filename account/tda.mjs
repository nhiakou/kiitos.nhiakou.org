import { getData } from "/utils.mjs";

export async function getTDA() {
    const account = await getData('https://api.tdameritrade.com/v1/accounts/' + localStorage.getItem('account_id'), { fields: '' });
    const history = await getData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/transactions`, { type: 'trade', startDate: getDate(false), endDate: getDate(true) });
    return { account, history };
}

function getDate(now) {
    const dt = now ? new Date() : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const date = dt.toLocaleString().split(', ')[0].split('/');
    return `${date[2]}-${String(date[0]).padStart(2, '0')}-${String(date[1]).padStart(2, '0')}`;
}