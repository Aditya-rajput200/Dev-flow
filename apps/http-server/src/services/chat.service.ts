// chat service
 import Ably from 'ably';

const API_KEY = process.env.ABLY_API_KEY||null ;


// connectiob on to Ably
export const Connection_On_Ably = () =>{
  if (!API_KEY) {
    throw new Error('Ably API key is not set');
  }
  try {
      const ably = new Ably.Realtime({ key: API_KEY });
      ably.connection.on('connected', () => {
      console.log('Connected to Ably!');
      ably.connection.on('disconnected', () => {
        console.log('Disconnected from Ably');
      });
      ably.connection.on('failed', () => {
        console.error('Failed to connect to Ably');
      });
      ably.connection.on('closed', () => {
        console.log('Ably connection closed');
      }); 

});
    
  } catch (error) {
    console.error('Error connecting to Ably:', error);
    throw error;
    
  }

}

//connection off Ably
export const Connection_Off_Ably = () => {

  if (!API_KEY) {
    throw new Error('Ably API key is not set');
  }
  try {
    const ably = new Ably.Realtime({ key: API_KEY });
    ably.connection.close();
    console.log('Ably connection closed');
  } catch (error) {
    console.error('Error closing Ably connection:', error);
    throw error;
  }
}

export const getChannel = (channelName: string) => {
  if (!API_KEY) {
    throw new Error('Ably API key is not set');
  }
  const ably = new Ably.Realtime({ key: API_KEY });
  if (!ably) throw new Error('Ably is not connected');
  return ably.channels.get(channelName);
};

