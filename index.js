import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const { PENDO_API_KEY, HUBSPOT_API_KEY } = process.env;

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
        `${baseUrl}/contacts/${version}/createOrUpdate/`
          + `email/${email}?hapikey=${hubspotApiKey}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ properties: properties })
          });
    }
  };
}({
  baseUrl: 'https://api.hubspot.com',
  version: 'v1',
  hubspotApiKey: HUBSPOT_API_KEY
}));
  

export function preprocessPendoEvent(payload) {
  const { event, visitorId, properties: { nps } } = payload;
  return new Promise((resolve, reject) => {
    if (!nps) {
      reject(`npsSubmitted is expected but was ${event}`);
    } 
    resolve({ event, visitorId, nps });
  });
};

export function getVisitorEmail(options) {
  return pendoClient.getVisitor(options.visitorId)
    .then((response) => {
      if (!response.ok) { Promise.reject('Network response was not OK.'); }
      return response.json()
    })
    .then((body) => {
      const { email, metadata: { agent: { email: agent_email } } } = body;
      return email || agent_email;
    })
    .catch((error) => console.error(error));
}

export function updateHubSpotContact(options) {
  return hubspotClient.createOrUpdateContact(options.email, [
    { property: 'nps_rating', value: options.npsRating }
  ]);
}

export async function handler(event, context) {
  preprocessPendoEvent(event.body)
    .then((payload) => {
      return Promise.all([
        getVisitorEmail({ visitorId: payload.visitorId }),
        payload.nps.rating
      ])
    })
    .then(([email, npsRating]) => {
      return updateHubSpotContact({ email, npsRating });
    })
    .then((response) => {
      if (!response.ok) {
        Promise.reject('A problem occurred while create a HubSpot contact: '
                       + `${response.status} ${response.statusText}`);
      }
    })
    .catch((error) => console.error(error));
}




