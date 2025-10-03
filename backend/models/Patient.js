/**
 * Patient Model - Patient Register with CRUD operations
 * 
 * Comprehensive patient data model for chronic disease management
 * Includes demographics, chronic conditions, and review tracking
 */

const mongoose = require('mongoose');
const validator = require('validator');

const patientSchema = new mongoose.Schema({
  // Demographics
  nhsNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'NHS Number must be 10 digits'
    }
  },
  
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'not_specified'],
    required: true
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[0-9\s\+\-\(\)]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || validator.isEmail(v);
        },
        message: 'Invalid email format'
      }
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      postcode: String,
      country: { type: String, default: 'UK' }
    }
  },
  
  // GP Registration
  gpPractice: {
    practiceCode: String,
    practiceName: String,
    registrationDate: Date
  },
  
  // Chronic Conditions (references to DiseaseKPI)
  chronicConditions: [{
    diseaseType: {
      type: String,
      enum: ['diabetes', 'copd', 'heart_failure', 'ckd', 'cad', 'hypertension']
    },
    diagnosisDate: Date,
    snomedCode: String,
    diseaseKPIRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiseaseKPI'
    },
    active: {
      type: Boolean,
      default: true
    }
  }],
  
  // Clinical Measurements (latest)
  latestMeasurements: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      recordedDate: Date
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'kg' },
      recordedDate: Date
    },
    height: {
      value: Number,
      unit: { type: String, default: 'cm' },
      recordedDate: Date
    },
    bmi: {
      value: Number,
      recordedDate: Date
    },
    smokingStatus: {
      status: {
        type: String,
        enum: ['never', 'ex_smoker', 'current_smoker', 'unknown']
      },
      recordedDate: Date
    }
  },
  
  // Recall and Review Tracking
  reviews: [{
    reviewType: String,
    dueDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['due', 'overdue', 'completed', 'cancelled'],
      default: 'due'
    },
    notes: String
  }],
  
  // Alerts and Notifications
  alerts: [{
    alertType: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    message: String,
    createdDate: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedDate: Date
  }],
  
  // QOF Status
  qofStatus: {
    totalPoints: Number,
    achievedPoints: Number,
    achievementPercentage: Number,
    lastCalculated: Date,
    exceptions: [{
      diseaseType: String,
      reason: String,
      dateRecorded: Date
    }]
  },
  
  // Audit Trail
  active: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastAccessedAt: Date
});

// Calculate age from date of birth
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Full name virtual
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to update timestamp
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate BMI if height and weight are available
patientSchema.methods.calculateBMI = function() {
  if (this.latestMeasurements.weight?.value && this.latestMeasurements.height?.value) {
    const heightInMeters = this.latestMeasurements.height.value / 100;
    const bmi = this.latestMeasurements.weight.value / (heightInMeters * heightInMeters);
    this.latestMeasurements.bmi = {
      value: Math.round(bmi * 10) / 10,
      recordedDate: new Date()
    };
  }
  return this.latestMeasurements.bmi;
};

// Check for overdue reviews
patientSchema.methods.getOverdueReviews = function() {
  const today = new Date();
  return this.reviews.filter(review => 
    review.status === 'due' && 
    review.dueDate < today
  );
};

// Indexes for efficient queries
patientSchema.index({ nhsNumber: 1 });
patientSchema.index({ lastName: 1, firstName: 1 });
patientSchema.index({ 'chronicConditions.diseaseType': 1 });
patientSchema.index({ 'reviews.dueDate': 1, 'reviews.status': 1 });

module.exports = mongoose.model('Patient', patientSchema);
