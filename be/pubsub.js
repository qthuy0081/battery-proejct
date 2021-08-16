const {PubSub} = require('@google-cloud/pubsub')

const pubSubClient = new PubSub({keyFilename:'./battery-capacity-prediction-794a7b32748e.json'})


const subscriptionName = 'projects/battery-capacity-prediction/subscriptions/prediction_result-sub'
const timeout = 10

function listenForCloudMessage(callback){
    const subscription = pubSubClient.subscription(subscriptionName)

    let messageCount = 0;

    console.log('Listening...')
    const messageHandler =  message => {
      messageCount += 1;
      // console.log(`Received message ${message.id}:`);
      // console.log(`\tData: ${message.data}`);
      // console.log(`\tAttributes: ${message.attributes}`);
      // console.log(`\tTotal: ${messageCount}`);
      callback(message.data)
      //connection.sendUTF(message)
      // "Ack" (acknowledge receipt of) the message
      message.ack();
      //subscription.removeListener('message', messageHandler)
    }
    subscription.on('message',messageHandler)

    setTimeout(() => {
        subscription.removeListener('message', messageHandler);
        console.log(`${messageCount} message(s) received.`);
      }, timeout * 1000);
}


exports.listenForCloudMessage = listenForCloudMessage