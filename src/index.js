import { app } from './app.js';
import connectDB from './db/connect.js';
import { PORT } from './constants.js';

connectDB() // PROMISE => resolve, reject
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database', error);
  });
