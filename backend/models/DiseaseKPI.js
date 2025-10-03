/**
 * Disease KPI Model with SNOMED CT Codes
 * 
 * This model defines disease-specific KPI tracking using standardized SNOMED CT clinical terminology.
 * Each disease includes NHS QOF indicators and clinical targets.
 */

const mongoose = require('mongoose');

// SNOMED CT Code Schema
const snomedCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  display: String,
  system: {
    type: String,
    default: 'http://snomed.info/sct'
  }
});

// KPI Metric Schema
const kpiMetricSchema = new mongoose.Schema({
  metricName: String,
  value: Number,
  unit: String,
  target: Number,
  achievementStatus: {
    type: String,
    enum: ['achieved', 'not_achieved', 'exception', 'pending']
  },
  recordedDate: {
    type: Date,
    default: Date.now
  },
  nextReviewDate: Date
});

// Disease KPI Schema
const diseaseKPISchema = new mongoose.Schema({
  diseaseType: {
    type: String,
    required: true,
    enum: ['diabetes', 'copd', 'heart_failure', 'ckd', 'cad', 'hypertension']
  },
  
  snomedCode: snomedCodeSchema,
  
  // Disease-specific configurations
  diseaseConfig: {
    // Diabetes (Type 1 & Type 2) - SNOMED: 73211009, 44054006
    diabetes: {
      snomedCodes: {
        type1: { code: '46635009', display: 'Diabetes mellitus type 1' },
        type2: { code: '44054006', display: 'Diabetes mellitus type 2' }
      },
      kpiIndicators: {
        hba1c: {
          target: 53, // mmol/mol (7% DCCT)
          unit: 'mmol/mol',
          qofPoints: 17,
          reviewFrequency: 'quarterly'
        },
        bloodPressure: {
          systolicTarget: 140,
          diastolicTarget: 80,
          unit: 'mmHg',
          qofPoints: 10
        },
        cholesterol: {
          target: 5.0,
          unit: 'mmol/L',
          qofPoints: 6
        },
        footExam: {
          frequency: 'annual',
          qofPoints: 7
        },
        retinalScreening: {
          frequency: 'annual',
          qofPoints: 5
        }
      }
    },
    
    // COPD - SNOMED: 13645005
    copd: {
      snomedCode: { code: '13645005', display: 'Chronic obstructive pulmonary disease' },
      kpiIndicators: {
        fev1: {
          unit: 'L',
          qofPoints: 6,
          reviewFrequency: 'biannual'
        },
        mrcDyspnoeaScore: {
          scale: '1-5',
          qofPoints: 8
        },
        smokingStatus: {
          qofPoints: 10,
          reviewFrequency: 'annual'
        },
        influenzaVaccination: {
          frequency: 'annual',
          qofPoints: 5
        },
        pulmonaryRehab: {
          qofPoints: 7
        }
      }
    },
    
    // Heart Failure - SNOMED: 84114007
    heartFailure: {
      snomedCode: { code: '84114007', display: 'Heart failure' },
      kpiIndicators: {
        ejectionFraction: {
          unit: '%',
          qofPoints: 6
        },
        ntProBNP: {
          unit: 'pg/mL',
          qofPoints: 8
        },
        aceInhibitor: {
          qofPoints: 9,
          indicator: 'prescribed'
        },
        betaBlocker: {
          qofPoints: 8,
          indicator: 'prescribed'
        },
        annualReview: {
          frequency: 'annual',
          qofPoints: 10
        }
      }
    },
    
    // Chronic Kidney Disease - SNOMED: 709044004
    ckd: {
      snomedCode: { code: '709044004', display: 'Chronic kidney disease' },
      kpiIndicators: {
        egfr: {
          unit: 'mL/min/1.73m²',
          stages: {
            stage1: '>90',
            stage2: '60-89',
            stage3a: '45-59',
            stage3b: '30-44',
            stage4: '15-29',
            stage5: '<15'
          },
          qofPoints: 6
        },
        acr: {
          unit: 'mg/mmol',
          target: '<3',
          qofPoints: 6
        },
        bloodPressure: {
          systolicTarget: 140,
          diastolicTarget: 90,
          unit: 'mmHg',
          qofPoints: 11
        },
        annualReview: {
          frequency: 'annual',
          qofPoints: 9
        }
      }
    },
    
    // Coronary Artery Disease - SNOMED: 53741008
    cad: {
      snomedCode: { code: '53741008', display: 'Coronary arteriosclerosis' },
      kpiIndicators: {
        cholesterol: {
          target: 4.0,
          unit: 'mmol/L',
          qofPoints: 16
        },
        bloodPressure: {
          systolicTarget: 140,
          diastolicTarget: 90,
          unit: 'mmHg',
          qofPoints: 17
        },
        antiplatelet: {
          qofPoints: 7,
          indicator: 'prescribed'
        },
        influenzaVaccination: {
          frequency: 'annual',
          qofPoints: 5
        },
        annualReview: {
          frequency: 'annual',
          qofPoints: 7
        }
      }
    },
    
    // Hypertension - SNOMED: 38341003
    hypertension: {
      snomedCode: { code: '38341003', display: 'Hypertensive disorder' },
      kpiIndicators: {
        bloodPressure: {
          under80: {
            systolicTarget: 140,
            diastolicTarget: 90
          },
          over80: {
            systolicTarget: 150,
            diastolicTarget: 90
          },
          unit: 'mmHg',
          qofPoints: 20
        },
        cardiovascularRisk: {
          qofPoints: 5,
          assessmentFrequency: 'annual'
        },
        lifestyleAdvice: {
          qofPoints: 3,
          frequency: 'annual'
        }
      }
    }
  },
  
  // Current metrics for patient
  currentMetrics: [kpiMetricSchema],
  
  // QOF achievement tracking
  qofAchievement: {
    totalPointsAvailable: Number,
    pointsAchieved: Number,
    achievementPercentage: Number,
    lastCalculated: Date
  },
  
  // Exception reporting
  exceptions: [{
    reason: String,
    snomedCode: String,
    dateRecorded: Date,
    reviewDate: Date
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate QOF achievement
diseaseKPISchema.methods.calculateQOFAchievement = function() {
  // Implementation for QOF calculation logic
  const metrics = this.currentMetrics.filter(m => m.achievementStatus === 'achieved');
  const config = this.diseaseConfig[this.diseaseType];
  
  if (config && config.kpiIndicators) {
    const totalPoints = Object.values(config.kpiIndicators)
      .reduce((sum, indicator) => sum + (indicator.qofPoints || 0), 0);
    
    this.qofAchievement = {
      totalPointsAvailable: totalPoints,
      pointsAchieved: metrics.length * (totalPoints / Object.keys(config.kpiIndicators).length),
      lastCalculated: new Date()
    };
    
    this.qofAchievement.achievementPercentage = 
      (this.qofAchievement.pointsAchieved / this.qofAchievement.totalPointsAvailable) * 100;
  }
  
  return this.qofAchievement;
};

diseaseKPISchema.index({ diseaseType: 1 });
diseaseKPISchema.index({ 'snomedCode.code': 1 });

module.exports = mongoose.model('DiseaseKPI', diseaseKPISchema);
