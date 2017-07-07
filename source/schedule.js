const schedule = require('node-schedule')
import app from './index.js'

let j = schedule.scheduleJob('0 7,10,14,17 * * *', () => {
  console.log('The answer to life, the universe, and everything!');
});
