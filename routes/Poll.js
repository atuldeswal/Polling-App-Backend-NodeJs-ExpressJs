const express = require("express");
const router = express.Router();
const pollController = require("../controllers/PollController")


router.route('/')
    .get(pollController.getAllPolls)

    .post(pollController.createPoll)

    .put(pollController.votePoll);

router.route('/mypolls')
    .get(pollController.getUserPolls);

module.exports = router;

// Route to get a specific poll by ID with full details
router.route('/:id')
    .get(pollController.getFocusedPoll)
    .delete(pollController.deleteFocusedPoll);


