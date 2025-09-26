// Database connection
const URL = "mongodb+srv://zarikmen111:PgJBJIJXhgQ8rTM5@clustersvit.kutkmui.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSvit";
const connect = mongoose.connect(URL);
connect.then((db) => {
  console.log("MongoDB correctly connected to server");
}, (err) => {
  console.log(err);
}
);