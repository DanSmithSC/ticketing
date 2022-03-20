import nats from 'node-nats-streaming'
import { TicketCreatedPublisher} from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing','abc', {
  url: 'http://localhost:4222'
});

// Used temp Port-forwarding from local to the kubernetes nats pod. (DEV ONLY)
stan.on('connect', async () => {
  console.log('Publisher Connected to NATS')
  
  const publisher = new TicketCreatedPublisher(stan)
  try {
    await publisher.publish({
      id:'1234',
      title: 'concert',
      price: 200
    })
  } catch(err) {
    console.error(err)
  }
  


  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20
  // })

  // stan.publish('ticket:created', data, ()=> {
  //   console.log('Event Published: ', data);
  // })
});