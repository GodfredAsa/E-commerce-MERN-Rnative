## E-COMMERCE
### BRIEF: This is an e-commerce or online shop application developed with Node.js, ExpressJS, React Native and MOngoDB using Atlas cloud.

### SETUP GUIDE
### BACKEND 
* `npm init `
* `npm install nodemon`: monitoring utility for source code changes.
* `npm install express`: creating webserver

#### ENVIRONMENT VARIABLES 
* npm install dotenv

#### MIDDLEWARE 
In Express.js, middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. Middleware functions can perform various tasks, modify request and response objects, end the request-response cycle, and call the next middleware in the stack.
* npm install body-parser: its a library that enables the  backend to understand the json object sent to the client.
* <u>LOGGING REQUESTS:</u>  `npm install morgan`: Middle for logging requests

* <u>CONNECTING TO MONGODB</u> : `npm i mongoose`
* <u>ENABLE CROSS ORIGIN </u> : `npm i cors`
* <u>PASSWORD HASHING</u> : `npm i bcrypt`
* <u>TOKEN GENERATION</u> : `npm i jsonwebtoken`
* <u>SECURING APIs</u> : `npm i express-jwt`
* <u>FILE UPLOAD TO SERVER</u> : `npm i multer`

#### FILE UPLOAD TO SERVER CONFIGURATION
1. INSTALL MULTER `npm install multer`
2. CONFIGURATION
3. DESTINATION AND UPLOAD FILENAMES
4. TESTING OF UPLOAD FILES WITH POSTMAN: Single or Multiple 
5. VALIDATING UPLOAD FILE TYPES

### FRONTEND 
BRIEF: The client side of the application was built using expo. Expo enables the installation of an app from the play store used to scan the QR code when the client app is started in order to display the application of either android or iOS. 
#### SETUP GUIDE 
* `npm install expo-cli `
* `expo init --npm` : enables you to use expo with npm as expo by default uses yarn
* `npm start`

