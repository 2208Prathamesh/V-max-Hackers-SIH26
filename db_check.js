const mongoose = require('mongoose');
const Alert = require('./backend/src/models/Alert.js');
const SavedLocation = require('./backend/src/models/SavedLocation.js');
const User = require('./backend/src/models/User.js');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/weathergpt');
    
    const users = await User.find().limit(1);
    if (!users.length) {
      console.log('No users found in DB');
      process.exit(0);
    }
    
    const user = users[0];
    console.log('Test User:', user._id);
    
    const locations = await SavedLocation.find({ userId: user._id });
    console.log('Saved Locations for user:', JSON.stringify(locations, null, 2));
    
    const alerts = await Alert.find({ status: 'active' });
    console.log('Active Alerts in DB:', JSON.stringify(alerts, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
