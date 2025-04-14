const Poll = require("../models/PollModel");

const getAllPolls = async (req, res) => {
    try {
        const allPolls = await Poll.find().select("title question options totalVotes").lean();

        const simplifiedPolls = allPolls.map(poll => ({
            _id: poll._id,
            title: poll.title,
            question: poll.question,
            totalVotes: poll.totalVotes,
            options: poll.options.map(opt => opt.optionText)
        }));

        res.status(200).json(simplifiedPolls);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ "error": "Server error" });
    }
}

const createPoll = async (req, res) => {
    const { title, question, options } = req.body;
    if (!title || !question || !options) {
        res.status(400).json({ "error": "Invalid details" });
        return;
    }
    try {
        const newPoll = await Poll.create({
            "title": title,
            "question": question,
            "options": options,
            "createdBy": req.user._id
        })
        res.status(200).json({ "message": "Poll created successfully", "poll": newPoll });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ "error": "Server error" });
    }
}

const votePoll = async (req, res) => {
    try {
        const { pollId, optionIndex } = req.body;

        if (!pollId || optionIndex === undefined) {
            return res.status(400).json({ error: "Invalid details" });
        }

        if (pollId.length !== 24) {
            return res.status(400).json({ error: "Invalid poll id" });
        }

        const findPoll = await Poll.findById(pollId).exec();

        if (!findPoll) {
            return res.status(404).json({ error: "Poll not found" });
        }

        const findOption = findPoll.options[optionIndex];

        if (!findOption) {
            return res.status(404).json({ error: "Option not found" });
        }

        const hasVoted = findPoll.votedUsers.some(vote => vote.user.equals(req.user._id));

        if (hasVoted) {
            return res.status(400).json({ message: "User has already voted" });
        }

        findOption.votes++;
        findPoll.totalVotes++;

        findPoll.votedUsers.push({
            user: req.user._id,
            optionIndex: optionIndex
        });

        const result = await findPoll.save();

        return res.status(200).json({
            message: "Poll updated successfully",
            poll: result
        });

    } catch (err) {
        console.error("Error updating poll:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

const getUserPolls = async (req, res) => {
    try {
        const myPolls = await Poll.find({ createdBy: req.user._id }).select("title question options totalVotes createdAt").exec();
        res.status(200).json(myPolls);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ "error": "Server error" });
    }
}

const getFocusedPoll = async (req, res) => {
    try {
        const pollId = req.params.id;

        if (pollId.length !== 24) {
            return res.status(400).json({ error: "Invalid poll id" });
        }

        const poll = await Poll.findById(pollId).lean();

        if (!poll) {
            return res.status(404).json({ error: "Poll not found" });
        }

        // Find if current user has voted
        const userVoted = poll.votedUsers.find(vote => vote.user.toString() === req.user._id.toString());

        const pollResponse = {
            _id: poll._id,
            title: poll.title,
            question: poll.question,
            options: poll.options,
            totalVotes: poll.totalVotes,
            createdBy: poll.createdBy,
            userHasVoted: !!userVoted,
            userVotedOptionIndex: userVoted ? userVoted.optionIndex : null
        };

        res.status(200).json(pollResponse);
    }
    catch (err) {
        console.error("Error fetching poll:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

const deleteFocusedPoll = async (req, res) => {
    try {
        const pollId = req.params.id;

        if (pollId.length !== 24) {
            return res.status(400).json({ error: "Invalid poll ID" });
        }

        const deletedPoll = await Poll.findOneAndDelete({
            _id: pollId,
            createdBy: req.user._id // Optional: ensures only creator can delete
        });

        if (!deletedPoll) {
            return res.status(404).json({ error: "Poll not found or unauthorized" });
        }

        res.status(200).json({ message: "Poll deleted successfully" });
    } catch (err) {
        console.error("Error deleting poll:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getAllPolls,
    createPoll,
    votePoll,
    getUserPolls,
    getFocusedPoll,
    deleteFocusedPoll
}
