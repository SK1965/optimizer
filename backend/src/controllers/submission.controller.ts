import { Request, Response } from 'express';
import { CreateSubmissionInput } from '../types/submissions.types';
import { createSubmission, getSubmissionById } from '../services/submissionService';
import { processSubmission } from '../services/workerService';

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
        
        // Trigger worker asynchronously (fire and forget)
        processSubmission(id).catch(err => console.error(`Worker error for ${id}:`, err));
        
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
const getsubmissionController = async(req : Request , res : Response) => {
    const submission_id: string = req.params.id as string;
    if(!submission_id){
        return res.status(400).json({
            error : "submission_id not found"
        })
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