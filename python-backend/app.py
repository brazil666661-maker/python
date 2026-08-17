"""
Python Code Execution Backend
Secure sandboxed Python code execution service for the Vercel frontend
"""

from flask import Flask, request, jsonify
import subprocess
import tempfile
import os
import time
from datetime import datetime
import json

app = Flask(__name__)

# Configuration
TIMEOUT_SECONDS = 30
OUTPUT_LIMIT = 50000  # 50KB limit
MAX_CODE_LENGTH = 100000


class ExecutionResult:
    def __init__(self, success, output, error, exit_code, duration):
        self.success = success
        self.output = output
        self.error = error
        self.exit_code = exit_code
        self.duration = duration

    def to_dict(self):
        return {
            "success": self.success,
            "output": self.output,
            "error": self.error,
            "exitCode": self.exit_code,
            "duration": self.duration,
        }


def validate_code(code):
    """Validate and sanitize code"""
    if not code or not isinstance(code, str):
        return False, "Code is required and must be a string"
    
    if len(code) > MAX_CODE_LENGTH:
        return False, f"Code exceeds maximum length of {MAX_CODE_LENGTH} characters"
    
    if code.strip() == "":
        return False, "Code cannot be empty"
    
    return True, None


def execute_python(code, timeout=TIMEOUT_SECONDS):
    """
    Execute Python code safely in an isolated subprocess
    """
    start_time = time.time()
    
    # Create temporary directory and file
    with tempfile.TemporaryDirectory() as tmpdir:
        code_file = os.path.join(tmpdir, "code.py")
        
        # Write code to file
        try:
            with open(code_file, "w", encoding="utf-8") as f:
                f.write(code)
        except Exception as e:
            duration = time.time() - start_time
            return ExecutionResult(
                success=False,
                output="",
                error=f"Failed to write code to file: {str(e)}",
                exit_code=1,
                duration=duration,
            )
        
        # Execute code
        try:
            process = subprocess.Popen(
                ["python3", code_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=tmpdir,
                text=True,
                encoding="utf-8",
            )
            
            stdout, stderr = process.communicate(timeout=timeout)
            
            # Limit output size
            if len(stdout) > OUTPUT_LIMIT:
                stdout = stdout[:OUTPUT_LIMIT] + f"\n... (truncated, {len(stdout) - OUTPUT_LIMIT} more bytes)"
            
            if len(stderr) > OUTPUT_LIMIT:
                stderr = stderr[:OUTPUT_LIMIT] + f"\n... (truncated, {len(stderr) - OUTPUT_LIMIT} more bytes)"
            
            duration = time.time() - start_time
            
            return ExecutionResult(
                success=process.returncode == 0,
                output=stdout,
                error=stderr if stderr else "",
                exit_code=process.returncode,
                duration=round(duration, 3),
            )
        
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
            duration = time.time() - start_time
            return ExecutionResult(
                success=False,
                output="",
                error=f"Execution timeout exceeded ({timeout} seconds)",
                exit_code=-1,
                duration=round(duration, 3),
            )
        
        except Exception as e:
            duration = time.time() - start_time
            return ExecutionResult(
                success=False,
                output="",
                error=f"Execution error: {str(e)}",
                exit_code=1,
                duration=round(duration, 3),
            )


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Python Code Execution Backend"
    }), 200


@app.route("/api/run", methods=["POST"])
def run_code():
    """
    Execute Python code endpoint
    Expects: { "code": "python code here" }
    Returns: { "success": bool, "output": str, "error": str, "exitCode": int, "duration": float }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "output": "",
                "error": "Request body must be JSON",
                "exitCode": 1,
                "duration": 0,
            }), 400
        
        code = data.get("code", "").strip()
        
        # Validate code
        is_valid, error_msg = validate_code(code)
        if not is_valid:
            return jsonify({
                "success": False,
                "output": "",
                "error": error_msg,
                "exitCode": 1,
                "duration": 0,
            }), 400
        
        # Execute code
        result = execute_python(code)
        
        return jsonify(result.to_dict()), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "output": "",
            "error": f"Server error: {str(e)}",
            "exitCode": 1,
            "duration": 0,
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "output": "",
        "error": "Endpoint not found",
        "exitCode": 1,
        "duration": 0,
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "output": "",
        "error": "Internal server error",
        "exitCode": 1,
        "duration": 0,
    }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
