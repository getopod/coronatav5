# Build Automation Scripts

This directory contains automation scripts to streamline development, testing, and deployment workflows for the Coronata Game project.

## PowerShell Build Script

### Overview
`build-automation.ps1` is a comprehensive PowerShell script that provides automated workflows for:

- **Development**: Start dev server, install dependencies
- **Quality Assurance**: Linting, testing, code analysis
- **Building**: Production builds, Electron packaging
- **Maintenance**: Cleaning, security audits, release preparation

### Prerequisites
- **PowerShell** 5.1+ (Windows PowerShell) or PowerShell Core 7+
- **Node.js** 16+ and npm
- **Git** (for release workflows)

### Quick Start

```powershell
# From project root directory
.\scripts\build-automation.ps1 help

# Start development
.\scripts\build-automation.ps1 dev

# Run full project validation
.\scripts\build-automation.ps1 full-check

# Prepare for release
.\scripts\build-automation.ps1 release
```

### Available Commands

| Command | Description | Options |
|---------|-------------|---------|
| `install` | Install project dependencies | |
| `dev` | Start Vite development server | `-Watch` |
| `build` | Create production build | |
| `test` | Run Jest test suite | `-Coverage`, `-Watch` |
| `lint` | Run ESLint code linting | `-Fix` |
| `clean` | Remove build artifacts and cache | |
| `analyze` | Comprehensive code quality analysis | |
| `full-check` | Complete validation (lint + test + build + analyze) | |
| `release` | Prepare release with git validation | |
| `electron` | Build Electron desktop application | |

### Usage Examples

#### Development Workflow
```powershell
# Install dependencies
.\scripts\build-automation.ps1 install

# Start development server
.\scripts\build-automation.ps1 dev

# Run tests with coverage in watch mode
.\scripts\build-automation.ps1 test -Coverage -Watch
```

#### Quality Assurance
```powershell
# Lint code and auto-fix issues
.\scripts\build-automation.ps1 lint -Fix

# Run comprehensive analysis
.\scripts\build-automation.ps1 analyze

# Full project validation
.\scripts\build-automation.ps1 full-check
```

#### Production & Release
```powershell
# Clean project and create production build
.\scripts\build-automation.ps1 clean
.\scripts\build-automation.ps1 build

# Prepare release (includes full validation)
.\scripts\build-automation.ps1 release

# Build Electron desktop app
.\scripts\build-automation.ps1 electron
```

### Error Handling
The script includes comprehensive error handling and will:
- ✅ Validate project directory structure
- ✅ Check for required dependencies
- ✅ Provide colored output for better readability
- ✅ Exit with appropriate codes for CI/CD integration
- ✅ Show helpful error messages and suggestions

### Integration with VS Code

You can run these scripts directly from VS Code:

1. **Terminal**: Open PowerShell terminal and run commands
2. **Tasks**: Add to `.vscode/tasks.json` for quick access
3. **Keybindings**: Assign shortcuts to common workflows

### Example VS Code Task Configuration

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Full Check",
      "type": "shell",
      "command": ".\\scripts\\build-automation.ps1",
      "args": ["full-check"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$eslint-stylish", "$tsc"]
    }
  ]
}
```

### Continuous Integration

The script is designed for CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Run Full Check
  run: |
    pwsh -File scripts/build-automation.ps1 full-check
  shell: pwsh
```

### Customization

You can extend the script by:
- Adding new commands to the switch statement
- Modifying validation checks
- Adding project-specific analysis tools
- Integrating with additional build tools

### Troubleshooting

**Common Issues:**

1. **Execution Policy**: If you get execution policy errors:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Path Issues**: Always run from project root directory

3. **Node.js Not Found**: Ensure Node.js is installed and in PATH

4. **Permission Errors**: Run PowerShell as Administrator if needed

### Support

For issues with the build automation script:
1. Check the error messages and suggestions
2. Verify all prerequisites are installed
3. Ensure you're in the correct directory
4. Review the verbose output with `-Verbose` flag

---

**Note**: This script is designed specifically for the Coronata Game project structure. Modify as needed for different project layouts.