import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { renderTemplate } from '../src/services/covid/utils.js';

test('should render data into country template', () => {
  const result = renderTemplate('country')({
    date: '21 April 2010',
    country: 'Indonesia',
    confirmed: 100,
    deaths: 90,
    recovered: 10,
    active: 1,
  });

  assert.fixture(
    result,
    `

<b>Covid-19 Report</b>

Country: <b><i>Indonesia</i></b>
Last Updated: <b><i>21 April 2010</i></b>

Total confirmed: <b>100</b>
Deaths: <b>90</b>
Recovered: <b>10</b>
Active: <b>1</b>`,
  );
});

test('should render data into global template', () => {
  const result = renderTemplate('global')({
    date: '20 April 2020',
    globalConfirmed: 1000,
    globalDeaths: 100,
    globalRecovered: 2000,
    indonesiaConfirmed: 1000,
    indonesiaDeaths: 50,
    indonesiaRecovered: 5,
  });
  assert.fixture(
    result,
    `

<b>Global Covid-19 Report</b>

Last Updated: <b><i>20 April 2020</i></b>

Global confirmed: <b>1000</b>
Global deaths: <b>100</b>
Global recovered: <b>2000</b>

Indonesia confirmed: <b>1000</b>
Indonesia deaths: <b>50</b>
Indonesia recovered: <b>5</b>`,
  );
});

test.run();
