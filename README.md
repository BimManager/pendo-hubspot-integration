# Deployment Step
```
npm install
emacs .env # to add credentials
zip -qr function.zip .

go to aws.amazon.com/lambda
click 'Get Started with AWS Lambda'
click 'Create function'
Function name: passNpsRatingFromPendoToHubspot
Runtime: Node.js 14.x
Architecture: x86_64
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


