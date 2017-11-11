const mongoose              = require('mongoose'),
      Schema                = mongoose.Schema;

const DebtSchema = new Schema(
  {
    receiver_id        : { type:String, required:false },
    lender_id          : { type:String, required:false },
    amount             : { type:Numberm required:false }
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);

module.exports = mongoose.model("Debt", AccountSchema);
