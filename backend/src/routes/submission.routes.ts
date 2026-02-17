import express from "express";
import { getsubmissionController, submissionController } from "../controllers/submission.controller";

const router = express.Router();

router.post('/submit',submissionController);
router.get('/submission/:id',getsubmissionController);


export default router;