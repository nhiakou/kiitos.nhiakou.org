import { createNatalChart, renderAstro } from './render/astro.mjs';
import { getTDA } from './tda.mjs';
import { renderAccount } from './render/account.mjs';
import { renderSummary } from './render/summary.mjs';

window.onload = async () => {
  const { transit } = createNatalChart('horoscope');
  renderAstro(new Date(), transit);

  const data = await getTDA();
  renderAccount(data.account);
  renderSummary(data.history);
}