import Link from "next/link"

const LandingPage = ({ currentUser, tickets }) => {

  const ticketList = tickets.map( ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
           <a className="nav-link">View Ticket</a>
          </Link>
        </td>
      </tr>
    )
  })

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Ticket Name</th>
            <th>Ticket Price</th>
            <th>Ticket Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
   )

  
}

// Fetch Data from a server and Generate Data. 
// This is where we do it before sending back to the Client.
LandingPage.getInitialProps = async (context, client, currentUser) => {
  const  { data } = await client.get('/api/tickets');

  return{ tickets: data }
  
}

export default LandingPage