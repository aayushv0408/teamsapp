const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const User = require('./User')(sequelize);
const Project = require('./Project')(sequelize);
const Task = require('./Task')(sequelize);

Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
};
