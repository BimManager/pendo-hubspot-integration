import assert from 'node:assert';
import { exec } from 'node:child_process';
import fetch from 'node-fetch';

const payload = '{"app":{"id":-323232,"name":"Fohlio_Inc","platform":"web"},"accountId":"7287","subscription":{"id":6215268572069888,"name":"Fohlio_Inc"},"userAgent":"Mozilla/5.0 (Linux; Android 12; SM-G990W) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36","event":"npsSubmitted","properties":{"guideId":"098uPWx2kKXhmv1f1TG3TH3tCYI","guideProperties":{"createdAt":1579711013332,"createdByUser":{"username":"matt.abedi@fohlio.com"},"id":"098uPWx2kKXhmv1f1TG3TH3tCYI","lastUpdatedAt":1637775948176,"lastUpdatedByUser":{"username":"humamk@fohlio.com"},"name":"Initial NPS Survey 1.22.2020","steps":[{"id":"4qGdqfO6HBCFEDDFD3KNof518Qs","lastUpdatedAt":1579712019979,"resetAt":0,"type":""},{"id":"JzViZ0va1q5AN8Bh9zNx4DXvNt4","lastUpdatedAt":1579712019979,"resetAt":0,"type":""}]},"guideStepId":"4qGdqfO6HBCFEDDFD3KNof518Qs","language":"","nps":{"rating":10,"reason":"","source":"email"}},"timestamp":1668376247,"visitorId":"8643","uniqueId":"db01e3524a5cc28bdcb98c000c5ea20fd6b60de0"}';

(function testPassNpsRatingFromPendoToHubspot() {
  exec('aws lambda get-function-url-config '
       + ' --function-name passNpsRatingFromPendoToHubspot'
       + ' --query "FunctionUrl"'
       + ' --output text',
       (error, stdout, stderr) => {
         const functionUrl = stdout.trim();
         fetch(functionUrl, {
           method: 'POST',
           headers: {
             'content-type': 'application/json'
           },
           body: payload
         })
           .then((response) => {
             assert.equal(response.ok, true);
             assert.equal(response.status, 200);
             assert.equal(response.statusText, 'OK');
           })
           .catch((error) => assert.fail(error));
       });
}());
