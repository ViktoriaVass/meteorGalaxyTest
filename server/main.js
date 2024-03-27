
import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  
  const path = require('path')

  // Require Provider 
  const lti = require('ltijs').Provider
  
  // Setup provider
  lti.setup('LTIKEY', // Key used to sign cookies and tokens
    { // Database configuration
      url: 'mongodb://127.0.0.1:3001/meteor',
      connection: { user: '', pass: '' }
    },
    { // Options
      appRoute: '/', loginRoute: '/login', // Optionally, specify some of the reserved routes
      cookies: {
        secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
        sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
      },
      devMode: true // Set DevMode to false if running in a production environment with https
    }
  )
  
  // Set lti launch callback
  lti.onConnect((token, req, res) => {
    console.log('OnConnect', token)
    return res.send('It\'s alive!')
  })
  
  lti.onInvalidToken(async (req, res, next) => {
    console.log('Invalid Token', req)
    return res.status(401).send(res.locals.err) 
  })

  lti.onUnregisteredPlatform((token, req, res) => {
    console.log('Unregistered Plattform', token)

  })

  const setup = async () => {
    // Deploy server and open connection to the database
    await lti.deploy({ port: 3010 }) // Specifying port. Defaults to 3000
  
    // Register platform
    await lti.registerPlatform({
      url: 'https://saltire.lti.app/platform',
      name: 'Platform Name',
      clientId: 'saltire.lti.app',
      authenticationEndpoint: 'https://saltire.lti.app/platform/auth',
      accesstokenEndpoint: 'https://saltire.lti.app/platform/token/sc91aa5be4882e2f6051a53292b983be2',
      authConfig: { method: 'JWK_SET', key: `https://saltire.lti.app/platform/jwks/sc91aa5be4882e2f6051a53292b983be2` }
    
    })
  }
  
   setup()
  
  // // If the Links collection is empty, add some data.
  // if (await LinksCollection.find().countAsync() === 0) {
  //   await insertLink({
  //     title: 'Do the Tutorial',
  //     url: 'https://react-tutorial.meteor.com/simple-todos/01-creating-app.html',
  //   });

  //   await insertLink({
  //     title: 'Follow the Guide',
  //     url: 'https://guide.meteor.com',
  //   });

  //   await insertLink({
  //     title: 'Read the Docs',
  //     url: 'https://docs.meteor.com',
  //   });

  //   await insertLink({
  //     title: 'Discussions',
  //     url: 'https://forums.meteor.com',
  //   });
  // }

  // // We publish the entire Links collection to all clients.
  // // In order to be fetched in real-time to the clients
  // Meteor.publish("links", function () {
  //   return LinksCollection.find();
  // });
});
