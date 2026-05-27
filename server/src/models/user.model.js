import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {type: String , required: true},
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String , enum: ['male', 'female', 'other' ,''], default: '' },
  profilePicture : { 
    link: {
    type: String,
    default: ""
    },
    fileName: {
      type: String,
      default: ""
    }
  },
  bio : { type: String , default: ''},
  followers: [{type:mongoose.Schema.Types.ObjectId , ref:'User'}],
  following: [{type:mongoose.Schema.Types.ObjectId , ref:'User'}],
  posts: [{type:mongoose.Schema.Types.ObjectId , ref:'Post'}],
  bookmarks: [{type:mongoose.Schema.Types.ObjectId , ref:'Post'}],
  messageInbox: [{type:mongoose.Schema.Types.ObjectId , ref:'User'}]
} , {timestamps : true});

const User =  mongoose.model('User', userSchema);
export default User 
