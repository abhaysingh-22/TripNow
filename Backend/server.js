import { createServer } from 'http';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const server = createServer(app);


// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      console.log('Please kill the process or use a different port');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});