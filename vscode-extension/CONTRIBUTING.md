# Contributing to AutoDBA

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/autodba-vscode-extension.git
   cd autodba-vscode-extension
   ```

2. Install dependencies:
   ```bash
   # Install extension dependencies
   bun install

   # Install webview dependencies
   cd webview
   bun install
   cd ..
   ```

3. Configure development environment:
   - Create a `.env` file in the root directory:
     ```
     POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/dbname
     ```
   - Update `package.json` with your extension details

4. Build the extension:
   ```bash
   # Build the extension
   bun run build

   # Build the webview
   cd webview
   bun run build
   cd ..
   ```

5. Run in development mode:
   ```bash
   # Start the extension in debug mode
   bun run watch
   ```
   Then press F5 in VSCode to start debugging

## Development Guidelines

### Project Structure
```
.
├── .assistant/           # AI Assistant reference files
│   ├── insight_format.md       # Insight data structure documentation
│   ├── insight_examples.json   # Example insights for reference
│   └── prompts/               # AI prompt templates
│       ├── insight_generation.md    # Guidelines for generating insights
│       └── code_comment_style.md    # Code documentation standards
├── webview/              # Webview UI components
│   ├── src/              # Source files
│   │   ├── components/   # Svelte components
│   │   └── lib/         # Shared utilities
│   └── public/          # Static assets
└── src/                  # Extension source code
    ├── commands/        # VSCode commands
    ├── providers/       # Language and hover providers
    └── utils/          # Utility functions
```

### AI Assistant Reference
The `.assistant` directory contains reference files used by the AI assistant to maintain consistency in:
- Insight data structure and format
- Code documentation standards
- Example implementations
- Best practices

Key files:
- `insight_format.md`: Documents the structure of insights and their types
- `insight_examples.json`: Contains real-world examples of insights
- `prompts/insight_generation.md`: Guidelines for generating new insights
- `prompts/code_comment_style.md`: Standards for code documentation

### Code Style
- Follow the code comment style guidelines in `.assistant/prompts/code_comment_style.md`
- Use TypeScript for type safety
- Follow the project's ESLint configuration

### Insight Development
- Use the insight format documentation in `.assistant/insight_format.md`
- Reference `.assistant/insight_examples.json` for examples
- Follow the guidelines in `.assistant/prompts/insight_generation.md`

### Testing
- Write unit tests for new features
- Test insights with real database scenarios
- Verify UI components in different themes

### Documentation
- Update README.md for significant changes
- Document new features in the appropriate `.assistant` files
- Keep code comments up to date

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and verify functionality
5. Submit a pull request

## Requirements

- Node.js (v18 or higher)
- VSCode (v1.60.0 or higher)
- PostgreSQL (v14 or higher)
- Bun (latest version) 