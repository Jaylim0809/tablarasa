  const mongoose = require('mongoose');
  // const passportLocalMongoose = require('passport-local-mongoose');

  const taskSchema = mongoose.Schema({
    accessCode: {
      type: String,
      required: true,
      unique: true
    },
    datetime: {
      type: Date,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    grade: {
      type: Number,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    lesson: {
      type: String,
      required: true
    },
    sublesson: {
      type: String,
      required: true
    },
    activity: {
      a1: {
        type: String,
        required: true
      },
      a2: {
        type: String,
      },
      a3: {
        type: String,
      },
      a4: {
        type: String,
      },
      a5: {
        type: String,
      },
      a6: {
        type: String,
      }
    },
    path: {
      type: String,
      required: false
    },
    activeGrade: {
      type: Number,
      required: false,
      default: null
    },
    activeClassroom: {
      type: Number,
      required: false,
      default: null
    },
    activeGroup: {
      type: Number,
      required: false,
      default: null
    }
  });

  const boardSchema = mongoose.Schema({
    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    grade: {
      type: Number,
      required: true
    },
    classroom: {
      type: Number,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    datetime: {
      type: Date,
      required: true
    },
    board: {
      type: Object,
      required: true
    },
    accessCode: {
      type: String,
      required: true
    },
    activity: {
      type: String,
      required: true
    }
  });

  module.exports = {
    Board: mongoose.model('Board', boardSchema),
    Task: mongoose.model('Task', taskSchema)
  }