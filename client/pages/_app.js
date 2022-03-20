import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/Header';


//Thin wrapper around the components
const AppComponent =  ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser}/>
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
     
    </div>
    
  )
}

// Fetch Data from a server and Generate Data. 
// This is where we do it before sending back to the Client.
AppComponent.getInitialProps = async (appContext) => {
  
  //context is the first argument of the request
  const client = buildClient(appContext.ctx)

  const { data } = await client.get('/api/users/currentuser')

  let pageProps = {};
  if( appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps( appContext.ctx, client, data.currentUser )
  }

  return {
    pageProps,
    ...data
  }
  
}

export default AppComponent