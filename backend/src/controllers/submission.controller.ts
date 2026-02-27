import { Request, Response } from 'express';
import { CreateSubmissionInput } from '../types/submissions.types';
import { createSubmission, getSubmissionById } from '../services/submissionService';
import { processSubmission } from '../services/workerService';

const submissionController = async(req : Request , res : Response) => {
    const { code, language } = req.body;

    if (typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid or missing field: code must be a non-empty string' });
    }
    if (typeof language !== 'string' || language.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid or missing field: language must be a non-empty string' });
    }

    console.log(`[API] Received code length: ${code.length}, language: ${language}`);

    try {
        const id : string = await createSubmission({ code, language });
        
        // Trigger worker asynchronously (fire and forget)
        processSubmission(id).catch(err => console.error(`Worker error for ${id}:`, err));
        
        // NOTE: key is `submissionId` (camelCase) — must match frontend api.ts expectation
        res.status(201).json({
            message : 'Submission created successfully',
            submissionId : id
        });
    } catch (error) {
        console.error('[API] createSubmission error:', error);
        res.status(500).json({
            message : 'Internal Server Error',
        });
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