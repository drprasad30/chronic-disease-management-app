const Patient = require('../models/Patient');
const cron = require('node-cron');

class RecallEngine {
  static async checkDueReviews() {
    const today = new Date();
    const patients = await Patient.find({ active: true });

    const alerts = [];

    patients.forEach(patient => {
      patient.reviews.forEach(review => {
        if (['due', 'overdue'].includes(review.status)) {
          const isOverdue = review.dueDate && review.dueDate < today;
          const daysOverdue = review.dueDate
            ? Math.floor((today - review.dueDate) / (1000 * 60 * 60 * 24))
            : 0;

          if (review.status === 'due' || isOverdue) {
            alerts.push({
              patientId: patient._id,
              patientName: `${patient.firstName} ${patient.lastName}`.trim(),
              nhsNumber: patient.nhsNumber,
              reviewType: review.reviewType,
              dueDate: review.dueDate,
              status: isOverdue ? 'overdue' : review.status,
              daysOverdue: isOverdue ? Math.max(daysOverdue, 0) : 0,
              priority: isOverdue
                ? daysOverdue > 30
                  ? 'high'
                  : daysOverdue > 14
                    ? 'medium'
                    : 'low'
                : 'low'
            });

            if (isOverdue && review.status !== 'overdue') {
              review.status = 'overdue';
            }
          }
        }
      });
    });

    await Promise.all(patients.map(patient => patient.save()));

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    });
  }

  static scheduleRecallChecks() {
    cron.schedule('0 8 * * *', async () => {
      console.log('Running scheduled recall check...');
      const alerts = await this.checkDueReviews();
      console.log(`Generated ${alerts.length} recall alerts`);
    });
  }
}

module.exports = RecallEngine;
