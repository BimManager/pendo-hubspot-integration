import { log, inspect } from 'node:util';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export function checkEnv(options) {
  options.keys
    .filter((key) => !(key in process.env))
    .forEach((key) => options.onMissing(key));
}

checkEnv({
  keys: [ 'PENDO_API_KEY', 'HUBSPOT_API_KEY' ],
  onMissing: (key) => {
    console.error(`${key} is undefined. Exiting...`);
    process.exit(1);
  }
});

const { PENDO_API_KEY, HUBSPOT_API_KEY } = process.env;

function formatFetchResponse(response) {
  return new Promise((resolve, reject) => {
    const reply = {
      ok: false,
      isBase64Encoded: false,
      statusCode: response.status,
      headers: response.headers,
      body: { statusText: response.statusText },
      error: null
    };
    if (response.ok) {
      response.json()
        .then((body) => {
          reply.ok = true;
          reply.body = body;
          resolve(reply);
        })
        .catch((error) => {
          reply.error = error;
          reject(reply)
        });
    } else {
      reject(reply);
    }
  });
}

export function formatResponse(options) {
  options = options || {};
  return {
    isBase64Encoded: options.isBase64Encoded || false,
    statusCode: options.statusCode || 200,
    headers: Object.assign({
      'content-type': 'application/json'
    }, options.headers),
    body: options.body || {}
  };
}


const pendoClient = (function (options) {
  const { baseUrl, version, pendoApiKey } = options;
  const headers = {
    'content-type': 'application/json',
    'x-pendo-integration-key': pendoApiKey
  };
  return {
    getVisitor: function (visitorId) {
      return fetch(`${baseUrl}/${version}/visitor/${visitorId}`, {
        method: 'GET',
        headers: headers
      });
    }
  };
}({
  baseUrl: 'https://app.pendo.io/api',
  version: 'v1',
  pendoApiKey: PENDO_API_KEY
}));

const hubspotClient = (function (options) {
  const { baseUrl, version, hubspotApiKey } = options;
  const headers = {
    'content-type': 'application/json',
  };
  return {
    createOrUpdateContact: function (email, properties) {
      return fetch(
        `${baseUrl}/contacts/${version}/contact/createOrUpdate/`
          + `email/${email}?hapikey=${hubspotApiKey}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ properties: properties })
          });
    }
  };
}({
  baseUrl: 'https://api.hubapi.com',
  version: 'v1',
  hubspotApiKey: HUBSPOT_API_KEY
}));

function isWebhookTest(payload) {
  payload = JSON.parse(payload);
  const { event, app: { name } } = payload;
  return 'ping' === event && 'webhook-test' === name;
}

export function preprocessPendoEvent(payload) {
  payload = JSON.parse(payload);
  const { event, visitorId, properties: { nps } } = payload;
  return new Promise((resolve, reject) => {
    if (!nps) {
      reject(formatResponse({
        statusCode: 400,
        body: { error: 'nps is not defined' }
      }));
    } else {
      resolve({ visitorId, npsRating: nps.rating });
    }
  });
};

export function getVisitorEmail(visitorId) {
  return pendoClient.getVisitor(visitorId)
    .then((response) => {
      return formatFetchResponse(response)
        .then((response) => {
          const { email, metadata: { agent: { email: agent_email } } }
                = response.body;
          return email || agent_email;
        })
        .catch((error) => error);
    })
    .catch((error) => error);
}

export function updateHubSpotContact(options) {
  return hubspotClient.createOrUpdateContact(options.email, [
    { property: 'nps_rating', value: options.npsRating }
  ]);
}

export async function handler(event, context) {
  log(event);
  if (isWebhookTest(event.body)) {
    return Promise.resolve(formatResponse({ statusCode: 200 }));
  }
  return preprocessPendoEvent(event.body)
    .then((pendoEvent) => Promise.all(
      [ getVisitorEmail(pendoEvent.visitorId), pendoEvent.npsRating ]))
    .then(([email, npsRating]) => updateHubSpotContact({ email, npsRating }))
    .then((response) => formatFetchResponse(response))
    .catch((error) => error);
}




