# Technical Summary: Optimizer – AI-Powered Code Execution & Complexity Engine

**Date**: 2026-02-18
**Branch**: `main`
**Stack**: Node.js, TypeScript, Docker, PostgreSQL, Python

## 1. High-Level Overview
This update introduces a robust **Code Execution Sandbox** and a deterministic **Complexity Analysis Engine** (Phase 1: Python). The system now supports secure, isolated execution of untrusted code and provides Big O complexity estimation for "LeetCode-style" algorithmic submissions.

## 2. Code Execution Sandbox Infrastructure

### Architecture
- **Model**: Docker-based isolation with disposable containers.
- **Languages**: C, C++, Java, Python, JavaScript (Node.js).
- **Security**:
    - **Memory Limit**: 512MB per container.
    - **Network**: Completely disabled (--network none).
    - **Timeout**: 5 seconds hard limit.
    - **User**: Code runs as non-root sandbox user.

### Key Components
- **Dockerfile.sandbox**: Multi-stage build containing GCC, G++, JDK, Python3, and Node.js.
- **DockerSandbox.ts**: Manages container lifecycle:
    1.  Generates UUID for execution.
    2.  Writes source code to os.tmpdir().
    3.  Spawns docker run with volume mounts.
    4.  Captures stdout/stderr streams.
    5.  Cleans up temporary files.

## 3. Complexity Analysis Engine (Python)

### Concept
Deterministic complexity estimation for algorithms using a scaling input approach (1k, 2k, 4k items).

### Components
- **Database**: Added columns for execution_time_{small,medium,large} and estimated_complexity.
- **PythonComplexityAnalyzer**:
    - Detects class Solution pattern.
    - Injects timing wrapper.
    - Executes code with scaled inputs.
    - Calculates time growth ratios (e.g., T_large / T_medium).
    - Estimates Big O (O(1), O(n), O(n)).
- **workerService.ts**: Routes eligible Python submissions to the analyzer.

## 4. Modules Implemented
- **ackend/src/sandbox/**:
    - Sandbox.ts: Interface definition.
    - DockerSandbox.ts: Docker implementation.
    - sandboxRunner.ts: Singleton instance export.
- **ackend/src/complexity/**:
    - ComplexityAnalyzer.ts: Interface definition.
    - python/PythonComplexityAnalyzer.ts: Python-specific logic.
- **ackend/src/scripts/**:
    - migrate_complexity.ts: Database migration script.

## 5. Database Changes
- **Table**: submissions`n- **New Columns**:
    - execution_time_small (DOUBLE PRECISION)
    - execution_time_medium (DOUBLE PRECISION)
    - execution_time_large (DOUBLE PRECISION)
    - estimated_complexity (VARCHAR(50))

> Migration script provided in ackend/src/scripts/migrate_complexity.ts.

## 6. Integration & Workflow
1.  **Submission**: User submits code via API.
2.  **Worker**: workerService receives the task.
3.  **Branching**:
    - If Python AND class Solution: **Complexity Mode**.
    - Else: **Standard Execution Mode**.
4.  **Complexity Mode Flow**:
    - Analyzer generates wrapper script.
    - code runs in Docker Sandbox.
    - Analyzer parses SMALL, MEDIUM, LARGE outputs.
    - DB updated with detailed stats + complexity estimate.

## 7. Testing Strategy
- **Sandbox Tests** (ackend/tests/sandbox.test.ts):
    - Verifies execution of all 5 languages.
    - Verifies timeout handling (infinite loops).
- **Complexity Tests** (ackend/tests/complexity.test.ts):
    - Verifies isComplexityMode signature detection.
    - Verifies Big O estimation logic with mocked timing data.

## 8. Non-Goals (This Phase)
- Frontend UI changes.
- Multi-parameter algorithm support.
- Array/Matrix input generation.
- AI-based runtime input generation.

## 9. Next Steps
1.  **Migration**: Run 
px ts-node backend/src/scripts/migrate_complexity.ts.
2.  **Manual Verification**: Test end-to-end flow with Docker running.
3.  **Expansion**: Add Java/C++ support to Complexity Engine.
