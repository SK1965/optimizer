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
