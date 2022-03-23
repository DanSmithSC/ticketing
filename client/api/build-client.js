import axios from "axios";

const buildClient = ({ req }) => {
  if(typeof window === 'undefined') {
    // We are on the Server.

    return axios.create({
      // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      baseURL:'http://www.denzik.xyz/',
      headers: req.headers
    })
  } else {
    // We must be on the browser.
    return axios.create({
      baseURL: '/'
    })
  }
  
}

export default buildClient;