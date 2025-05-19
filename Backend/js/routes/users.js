const express = require('express');
const router  = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  getUserProgress,
  createUser,
  getUserAssignmentProgress,
  getUserQuizProgress
} = require('../controllers/userController');

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.post('/', createUser);

router.get('/:id/progress', getUserProgress);
router.get('/:id/assignments/progress', getUserAssignmentProgress); 
router.get('/:id/quizzes/progress', getUserQuizProgress); 

module.exports = router;
