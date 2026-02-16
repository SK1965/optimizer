import { Request, Response } from 'express';
import { CreateSubmissionInput } from '../types/submissions.types';
import { createSubmission, getSubmissionById } from '../services/submissionService';

const submissionController = async(req : Request , res : Response) => {
    const submissionData : CreateSubmissionInput = req.body
    if(!submissionData){
        return res.status(400).json({
            error : "data not found"
        })
    }
    console.log(submissionData);
    try {
        const id : string = await createSubmission(submissionData);
        res.status(201).json({
            message : "Submission created successfully",
            submission_id : id
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "Internal Server Error",
        })
    }
}

    try {
        const submission = await getSubmissionById(submission_id);
        if(!submission){
            return res.status(404).json({
                error : "submission not found"
            })
        }
        res.status(200).json(submission)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error : "Internal Server Error"
        })
    }
}
export {submissionController , getsubmissionController};