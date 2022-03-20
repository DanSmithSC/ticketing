import Router from "next/router";
import { useEffect, useState } from "react";
import StripeCheckout from 'react-stripe-checkout';
import useRequest from "../../hooks/useRequest";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body:{
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders')
  })

  useEffect( () => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft/1000)) ;
    }
    
    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId)
    }
  }, [])

  if( timeLeft < 0 ){
    return (
      <div>Order Expired</div>
    )
  }
  // Possibility to extract stripe publishable key to file for readability.
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout 
        token={ ({ id }) => doRequest({ token: id}) }
        stripeKey="pk_test_51KbzEcDbI5EnspV412mFYvWmDCXXNhHZ0DIxD8l1KKylmYxwWSHGEE61AgN5NmjRQeafVkUtVQUmktYRN1IZrw8T004woiCie6"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`)
  
  return { order: data }
}

export default OrderShow;