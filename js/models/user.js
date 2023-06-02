const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');
var bcrypt = require("bcrypt-nodejs");
//해시 알고리즘 적용 회수, 높을수록 보안은 높음 속도는 느려짐
var SALT_FACTOR = 10;

const userSchema = mongoose.Schema({
  email: {type:String,required:true,unique:true},
  username : {type:String,required:true},
  password : {type:String,required:true},
  grade : {type:Number,required:true},
  classroom : {type:Number,required:true},
  number : {type:Number,required:true},
  role : {type:Number,required:true, defaultValue: 3},
    //관리자 1, 교사 2, 학생 3
  activation : {type:Boolean, required:true,defaultValue: false},
  provider : {type:String,defaultValue:'local'},
  snsId : {type:String,allowNull:true}
});

userSchema.methods.name = function(){
  console.log(this.username);
  return this.username;
};

//bcrypt를 위한 빈 함수
var noop = function(){};
//모델이 저장되기("save") 전(.pre)에 실행되는 함수
userSchema.pre("save",function(done){
  var user = this;
  if(!user.isModified("password")){
    return done();
  }
  bcrypt.genSalt(SALT_FACTOR,function(err,salt){
    if(err){return done(err);}
    bcrypt.hash(user.password,salt,noop,function(err,hashedPassword){
      if(err){return done(err);}
      user.password = hashedPassword;
      done();
    });
  });
});
// 비밀번호 검사하는 함수
  /*
userSchema.methods.checkPassword = async function(guess) {
  console.log('비밀번호 검사'+guess+this.password)


  try {
      const isMatch = await bcrypt.compare(guess, this.password);
      return isMatch;
  } catch (err) {
      throw err;
  }
};
*/

userSchema.methods.checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password, function(err, isSame) {
    if(err) throw err;
      done(err, isSame);
  });
}; 

module.exports = mongoose.model('User', userSchema);

