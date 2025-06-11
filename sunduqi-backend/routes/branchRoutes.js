const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

router.get('/branch-totals', branchController.getBranchTotals);
router.get('/', branchController.getAllBranches);
router.post('/', branchController.createBranch);
router.get('/:id', branchController.getBranchById);
router.put('/:id', branchController.updateBranch);
router.patch('/:id/toggle-active', branchController.toggleBranchActive);


module.exports = router;