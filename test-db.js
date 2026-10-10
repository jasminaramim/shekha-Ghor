import mongoose from 'mongoose';
const uri = "mongodb+srv://shekhaghor:RPsYa4j7SrACYvi7@cluster0.ssmpl.mongodb.net/shekhaghor?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).then(() => {
  console.log("SUCCESS");
  process.exit(0);
}).catch(err => {
  console.error("FAIL", err.message);
  process.exit(1);
});
