const Skill = require('../models/skillModel');
const factory = require('../controllers/handlerFactory');

exports.getAllSkills = factory.getAll(Skill);
exports.getSkill = factory.getOne(Skill, { path: 'users', select: 'name' });
exports.createSkill = factory.createOne(Skill);
exports.updateSkill = factory.updateOne(Skill);
exports.deleteSkill = factory.deleteOne(Skill);
