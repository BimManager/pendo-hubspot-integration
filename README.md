# Deployment Step
```
echo 'PENDO_API_KEY=***' > .env
echo 'HUBSPOT_API_KEY=***' >> .env
npm install
zip -qr function.zip .
```

## Using AWS Console
```
go to aws.amazon.com/lambda
click 'Get Started with AWS Lambda'
click 'Create function'
Function name: passNpsRatingFromPendoToHubspot
Runtime: Node.js 14.x
Arcnhitecture: x86_64
Permissions: Use an existing role -> lambda-role
Advanced settings:
Enable function URL:
Auth type: NONE
Configure CORS
click 'Create function'
go to Functions > passNpsRatingFromPendoToHubspot
click 'Upload from' -> '.zip file'
click 'Test'
```

## Using awscli


### In order to update the function code
```
aws lambda update-function-code --function-name 'passNpsRatingFromPendoToHubspot' --zip-file fileb://function.zip --publish
```
