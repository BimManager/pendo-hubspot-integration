import * as assert from 'assert';
import * as qs from 'querystring';

import { checkEnv, formatResponse, preprocessPendoEvent } from '../index.js';

const npsDisplayedEventPayload = {
  "app": {
    "id": -323232,
    "name": "test_application",
    "platform": "web"
  },
  "accountId": "Webhook Account",
  "subscription": {
    "id": 4802463602049999,
    "name": "test_application"
  },
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
  "event": "npsDisplayed",
  "properties": {
    "guideId": "FjHsQ7S8z0ircYxe3vO4GHawvwI",
    "guideProperties": {
      "createdAt": 1591024335185,
      "createdByUser": {
        "username": "pendo-user@example.com"
      },
      "id": "FjHsQ7S8z0ircYxe3vO4GHawvwI",
      "lastUpdatedAt": 1626804377122,
      "lastUpdatedByUser": {
        "username": "pendo-user@example.com"
      },
      "name": "Quarterly NPS",
      "steps": [
        {
          "id": "WkaB4F2droQ5sSqd-FvC7H9coJQ",
          "lastUpdatedAt": 1619546765626,
          "resetAt": 1592592811776,
          "type": ""
        },
        {
          "id": "oFs_eA1lF61Ywsg0js945UcG798",
          "lastUpdatedAt": 1605640318713,
          "resetAt": 1592592811776,
          "type": ""
        }
      ]
    },
    "guideStepId": "WkaB4F2droQ5sSqd-FvC7H9coJQ",
    "language": "en-US"
  },
  "timestamp": 1626804384,
  "visitorId": "Webhook Visitor",
  "uniqueId": "b1f15067d47df50a1207dc2d0ce6171a40f8304e"
};

const npsSubmittedEventPayload = {
  "app": {
    "id": -323232,
    "name": "test_application",
    "platform": "web"
  },
  "accountId": "Webhook Account",
  "subscription": {
    "id": 4802463602049999,
    "name": "test_application"
  },
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
  "event": "npsSubmitted",
  "properties": {
    "guideId": "FjHsQ7S8z0ircYxe3vO4GHawvwI",
    "guideProperties": {
      "createdAt": 1591024335185,
      "createdByUser": {
        "username": "pendo-user@example.com"
      },
      "id": "FjHsQ7S8z0ircYxe3vO4GHawvwI",
      "lastUpdatedAt": 1626804377122,
      "lastUpdatedByUser": {
        "username": "pendo-user@example.com"
      },
      "name": "Quarterly NPS",
      "steps": [
        {
          "id": "WkaB4F2droQ5sSqd-FvC7H9coJQ",
          "lastUpdatedAt": 1619546765626,
          "resetAt": 1592592811776,
          "type": ""
        },
        {
          "id": "oFs_eA1lF61Ywsg0js945UcG798",
          "lastUpdatedAt": 1605640318713,
          "resetAt": 1592592811776,
          "type": ""
        }
      ]
    },
    "guideStepId": "WkaB4F2droQ5sSqd-FvC7H9coJQ",
    "language": "en-US",
    "nps": {
      "rating": 9,
      "reason": "Keep up the great work!",
      "source": "web"
    }
  },
  "timestamp": 1626804431,
  "visitorId": "Webhook Visitor",
  "uniqueId": "ccb0f95474ae8b630ede92f8f8dbac03cddfc1c3"
};

(function testCheckEnv() {
  let keys = [ 'PENDO_API_KEY', 'HUBSPOT_API_KEY' ];
  checkEnv({ keys, onMissing: () => assert.fail() });
  keys = [ 'PENDO_API_KEY', 'HUBSPOT_API_KEY', 'DUMMY' ];
  checkEnv({ keys, onMissing: (key) => assert.equal(key, 'DUMMY') });
}());

(function testFormatResponse() {
  assert.equal(JSON.stringify(formatResponse()),
               JSON.stringify({
                 isBase64Encoded: false,
                 statusCode: 200,
                 headers: {
                   'content-type': 'application/json'
                 },
                 body: {}                 
               }));

  assert.equal(JSON.stringify(formatResponse({
    isBase64Encoded: true,
    statusCode: 203,
    headers: {
      'content-type': 'x-www-urlencoded'
    },
    body: qs.encode({ message: '42' })
  })),
  JSON.stringify({
    isBase64Encoded: true,
    statusCode: 203,
    headers: {
      'content-type': 'x-www-urlencoded'
    },
    body: 'message=42'
  }));
}());

(function testPreprocessPendoEvent_npsSubmittedEvent() {
  preprocessPendoEvent(npsSubmittedEventPayload)
    .then((parsed) => {
      assert.strict.ok(parsed.event);
      assert.strict.deepEqual(parsed.event, 'npsSubmitted');
      assert.strict.ok(parsed.nps);
      assert.strict.ok(parsed.nps.rating);
      assert.strict.ok(parsed.visitorId);
    })
    .catch((error) => assert.fail());
}());

(function testPreprocessPendoEvent_npsDisplayedEvent() {
  preprocessPendoEvent(npsDisplayedEventPayload)
    .then(() => assert.fail())
    .catch((error) => {
      assert.equal(JSON.stringify(error), JSON.stringify({
        isBase64Encoded: false,
        statusCode: 400,
        headers: {
          'content-type': 'application/json'
        },
        body: { error: 'npsSubmitted is expected but was npsDisplayed' }
      }));
    });
}());

setTimeout(() => console.log('TESTS HAVE PASSED'), 1000);
