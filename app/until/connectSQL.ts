// const userSchema = new Schema({
//   username: String,
//   password: String
// });
// const userModel = mongoose.model("user", userSchema);
// const user = new userModel();
import mongoose from "mongoose";

export function connect() {
  mongoose
    .connect(`mongodb://localhost/studentManagement`, {
      useUnifiedTopology: true
    })
    .then(con => {
      console.log("数据库连接成功");
    })
    .catch(err => {
      console.log("数据库连接失败", err);
    });
  return mongoose.connection;
}

const mongo = connect();

export default mongo;
