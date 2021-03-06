const mongoose              = require('mongoose'),
      Schema                = mongoose.Schema;

const AccountSchema = new Schema(
  {
    facebook       : {
      id           : String,
      token        : String,
      email        : String,
      name         : String
    },
    ledger_id          : { type:String, required:true },
    enduser_id         : { type:String, required:true }
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);

module.exports = mongoose.model("Account", AccountSchema);
