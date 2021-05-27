
# Ekko Init



This is the installation package that contains everything you need to manage realtime web applications using the Ekko framework.

This includes the following directories:

- `ekko_apps`
- `ekko_functions`


## Contents

- [Ekko Apps](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb)
- [Ekko Functions](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb)
- [Getting Started](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb)
    - [hello-ekko](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb)
    - [express-demo](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb)
    - [chat-demo](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb)
- [Further Information](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb)



## Ekko Apps

There are three demo apps in this directory that you can use to test out the Ekko framework.  These demos are also meant to help you in designing your own realtime web apps.

Included in this directory:

- `chat-demo` - a chat app
- `express-demo` - an express app that publishes "Hello World!" messages using `setInterval`
- `hello-ekko` - a simple web app that displays messages sent to the Ekko server


## Ekko Functions

This directory is where you will keep any of the Ekko Functions you create and deploy for use within your realtime web apps.  It also contains a number of sample Ekko Functions that you can use with either the demo apps in the `ekko_apps` directory or your own.

Included in this directory:

- `demo-angry` - a function that capitalizes and adds '!!!' to message text
- `demo-backwards` - a function that reverses the message text
- `demo-robot` - a function that converts message text into binary
- `demo-capitalize` - a function that capitalizes the message text
- `associations.json` - a JSON file that contains data for using Ekko Functions to process in transit messages in your realtime web apps.

## Getting Started



Getting started building realtime web applications using the Ekko framework is easy!  We suggest you try getting the demo apps up and running first to give you a sense of how this all works.


### hello-ekko

The best place to start is with the demo in the  `hello-ekko` directory.  Let's walk through how to get that up and running.

**Create the JWT's**

The first step is to create a JWT (JSON Web Token), which is needed to authorize the client app with the Ekko Server.  When you ran the `ekko init` command to install the Ekko framework on AWS,  a secret key was generated for Ekko.  This secret key is used to create JWT's.  Each realtime web app that you create will need to have its' own JWT. 

 Let's create one for the demo.  Type the following in the the command line:

```docker
ekko JWT hello-ekko
```

This will give you:

- Your Ekko server endpoint
- An Ekko client JWT for your client side code
- An Ekko admin JWT for your application server code

You will use this data in the next section, when you update the client code.

**Update the Client Code**

In every realtime web app that uses the Ekko framework, you will need to create a new instance of an Ekko client.  The `Ekko` class (Ekko client) is in a JS file hosted on a CDN. Open up the `index.html` file inside the `hello-ekko` app directory and you will see the `<script>` tag that includes the Ekko client for use with the app.

```html
<script src="https://d3irfuxwybyrt2.cloudfront.net/ekko-client-v2.2.6.js"></script>
```

You can find the open source code, as well as more information on the Ekko CIient, [here](https://github.com/ekko-realtime/client) .

Next, you will need to copy in your unique app information from the [Create the JWT's](https://www.notion.so/Ekko-Init-9269d362294141e9a8776281690ad0eb) section to your client side code.  Open up the `index.html` file, which contains the Javascript code you'll need to edit.  Replace `host` with your server endpoint, `jwt` with the Ekko client JWT,  `appName` with the same appName you used to generate the JWT, and `uuid` can be whatever you choose, but is used to uniquely identify the client.

```jsx
// Ekko
const ekko = new Ekko({
	host: "myEkkoServerEndpoint",
	jwt: "myAppJWT",
	appName: "hello-ekko",
	uuid: "myUniqueUUID",
});
```

**Test Out Messaging**

At this point you'll want to test out that everything is working properly.  Open the `index.html` file in a browser to see if it will successfully connect to the Ekko Server.  You should see that messages you send appear on the web page.

Let's explain a little more about how this is working.  In this demo, the client is subscribed to the `"greeting"` channel and all messages are being published to that channel.

```jsx
ekko.subscribe({ channels: ["greeting"] });

// App
form.addEventListener("submit", (event) => {
  event.preventDefault();

  ekko.publish({
    channel: "greeting",
    message: { text: input.value },
  });

  input.value = "";
});
```

When the Ekko server receives the published message from the client, it then emits this message to all clients (of the `hello-ekko` app) subscribed to the `"greeting"` channel.  What you see on the web page is the message received from the Ekko server.

```jsx
ekko.addListener({
   message: (ekkoEvent) => {
     console.log("Message: ", ekkoEvent);
     addMessage(ekkoEvent);
   },
  ...
	...
 });
```

You'll notice a few more event listeners, besides the `message` event listener...these are for `presence` and `status` events.  

```jsx
ekko.addListener({
  message: (ekkoEvent) => {
    console.log("Message: ", ekkoEvent);
    addMessage(ekkoEvent);
  },
  status: (ekkoEvent) => {
    console.log("Status: ", ekkoEvent);
    addStatus(ekkoEvent);
  },
  presence: (ekkoEvent) => {
    console.log("Presence: ", ekkoEvent);
    addPresence(ekkoEvent);
  },
});
```

Presence events are sent when a client connects and disconnects to a channel through the Ekko server.  To see presence events, add the `withPresence` argument to `ekko.subscribe()`:

```jsx
ekko.subscribe({ channels: ["greeting"], withPresence: true });
```

Status events are sent only to admin users (Ekko Client instances initialized with the admin JWT)

**Adding Ekko Functions**

Let's try adding some message processing to the `hello-ekko` demo.   We're going to walk through using the Ekko Function, `demo-capitalize` , from the `ekko_functions` directory.

Step 1: Deploy Ekko Function

Using the Ekko CLI tool, navigate to the `ekko_function` directory.  From there, type in the following command:

```jsx
ekko deploy demo-capitalize
```

This will deploy the demo-capitalize directory to AWS Lambda and you should see a successful response from the Ekko CLI if it worked.

Step 2: Deploy associations.json

We need to tell the Ekko Server to use the `demo-capitalize` function to process all messages published to the `"greeting"` channel.  In order to do this, we need to update the `associations.json` file and then upload it to the Ekko server (it actually gets uploaded to an Amazon S3 bucket, as well as the Ekko server, where it is cached).  

The updating of the `associations.json` file has already been done.  If you open up the file, you will see how that works:

```json
"applications": {
    "hello-ekko": {
      "channels": [
        { "channelName": "greeting", "functionNames": ["demo-capitalize"] }
      ]
    },
    
		...
  }
}
```

Next we need to upload the `associations.json` file to AWS.  From the command line, type in:

```jsx
ekko update associations.json
```

Once you've done that, you can reload the `index.html` file in the browser and test out sending messages again.  This time, you should see that your message text has been transformed by the Ekko Function.


### express-demo

This demo is to show you how you would connect to Ekko through an application server.  To get the `express-demo`app up and running, we'll need to go through the same steps as we did for the `hello-ekko` app.

Create the JWT's using the Ekko CLI:

```json
ekko jwt express-demo
```

Paste the server endpoint and the admin JWT from the terminal window into the `index.js` file:

```jsx
const ekko = new Ekko({
  host: "hostName",
  jwt: "adminJWT",
  appName: "express-demo",
  uuid: "myUniqueUUID",
});
```

Note that, since this is not a webpage, we needed to require the Ekko Client npm package:

```jsx
const Ekko = require("ekko-realtime-client");
```

Install all necessary node modules:

```jsx
npm install
```

Run the app:

```jsx
npm start
```

You should now see that the express app is running and sending `'Hello World!'` messages on the `"greeting"` channel.   

You might also notice that it is showing status events that have a `"nothing returned from lambdas"` message.  This is because the `associations.json` file, included with the init package, specifies that both `"demo-capitalize"` and `"demo-backwards"` should process messages on the `"greeting"` channel.  However, if you have not deployed **both** of these Ekko Functions, your message will not be processed by either. 

To deploy these functions you will need to use the Ekko CLI tool:

```jsx
ekko deploy demo-capitalize
ekko deploy demo-backwards
```

### chat-demo

The final demo is a chat app.   Setting this up is exactly the same as in the previous two demo apps.

Create the JWT's for the app:

```jsx
ekko jwt chat-demo
```

Paste your server endpoint and JWT into the `index.html` file:

```jsx
const ekko = new Ekko({
  host: "hostName",
  jwt: "clientJWT",
  appName: "chat-demo",
  uuid: "myUniqueUUID",
});  
```

This demo uses all of the demo Ekko Functions, so make sure they are all deployed using the Ekko CLI tool:

```jsx
ekko deploy demo-capitalize
ekko deploy demo-backwards
ekko deploy demo-angry
ekko deploy demo-robot
```

And finally, run your chat app by opening the `index.html` file in your browser window.  You can open it up in multiple browser windows to test multiple clients.  And voila!  You have a chat app using Ekko for realtime communication and in transit message processing.

## Further Information

For more information on Ekko, you can visit our website [https://ekko-realtime.com/](https://ekko-realtime.com/)
- 
