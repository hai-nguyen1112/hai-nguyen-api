const express = require('express');

const skillController = require('../controllers/skillController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(skillController.getAllSkills)
  .post(authController.protect, skillController.createSkill);

router
  .route('/:id')
  .get(skillController.getSkill)
  .patch(authController.protect, skillController.updateSkill)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    skillController.deleteSkill
  );

module.exports = router;
