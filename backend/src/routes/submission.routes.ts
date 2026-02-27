import express from "express";
import { getsubmissionController, submissionController, getBulkSubmissionsController } from "../controllers/submission.controller";

const router = express.Router();

router.post('/submit',submissionController);
router.get('/submission/:id',getsubmissionController);
router.post('/submissions/bulk', getBulkSubmissionsController);


export default router;