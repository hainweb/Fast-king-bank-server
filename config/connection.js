const { MongoClient } = require('mongodb');
const state = { db: null };

module.exports.connect = async function (done) {
  const url = 'mongodb+srv://ajinrajeshhillten:Zlkkf73UtUnnZBbU@bank.x6s92.mongodb.net/?retryWrites=true&w=majority&appName=bank';
  const dbname = 'bank2';

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    state.db = client.db(dbname);
    done();
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    done(err); 
  }
};

module.exports.get = function () { 
  return state.db;
};
