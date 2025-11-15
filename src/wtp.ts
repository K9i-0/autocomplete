// Generatorでworktree一覧を取得
const worktreeGenerator: Fig.Generator = {
  script: ["wtp list --format json 2>/dev/null || echo '[]'"],
  postProcess: (output) => {
    try {
      const worktrees = JSON.parse(output);
      return worktrees.map((wt: any) => ({
        name: wt.branch || wt.path,
        description: `${wt.path} (${wt.head?.substring(0, 8) || 'unknown'})`,
        icon: "🌳",
      }));
    } catch {
      return [];
    }
  },
};

// Gitブランチ一覧を取得
const branchGenerator: Fig.Generator = {
  script: ["git branch --all --format='%(refname:short)' 2>/dev/null"],
  postProcess: (output) => {
    if (output.startsWith("fatal:")) {
      return [];
    }
    return output.split("\n")
      .filter(branch => branch.trim())
      .map((branch) => ({
        name: branch.trim().replace(/^remotes\/[^\/]+\//, ""),
        description: "branch",
        icon: "fig://icon?type=git",
      }));
  },
};

const completionSpec: Fig.Spec = {
  name: "wtp",
  description: "A powerful Git worktree CLI tool",
  subcommands: [
    {
      name: "add",
      description: "Create a new worktree",
      args: {
        name: "branch",
        description: "Branch name to checkout",
        generators: branchGenerator,
      },
      options: [
        {
          name: ["-b"],
          description: "Create a new branch",
          args: {
            name: "new-branch",
            description: "Name of new branch",
          },
        },
        {
          name: ["--track"],
          description: "Set up tracking for remote branch",
          args: {
            name: "remote-branch",
            description: "Remote branch to track",
            generators: branchGenerator,
          },
        },
        {
          name: ["--force", "-f"],
          description: "Force creation even if worktree exists",
        },
      ],
    },
    {
      name: "list",
      description: "List all worktrees",
      options: [
        {
          name: ["--format"],
          description: "Output format",
          args: {
            name: "format",
            suggestions: ["json", "table"],
          },
        },
      ],
    },
    {
      name: "remove",
      description: "Remove a worktree",
      args: {
        name: "worktree",
        description: "Worktree to remove",
        generators: worktreeGenerator,
      },
      options: [
        {
          name: ["--with-branch"],
          description: "Remove the branch too",
        },
        {
          name: ["--force"],
          description: "Force removal even if dirty",
        },
        {
          name: ["--force-branch"],
          description: "Force delete branch even if not merged",
        },
      ],
    },
    {
      name: "cd",
      description: "Navigate to a worktree",
      args: {
        name: "worktree",
        description: "Worktree to navigate to",
        generators: worktreeGenerator,
        suggestions: [
          {
            name: "@",
            description: "Navigate to main worktree",
            icon: "🏠",
          },
        ],
      },
    },
    {
      name: "shell-init",
      description: "Initialize shell integration",
      args: {
        name: "shell",
        suggestions: [
          { name: "bash", description: "Bash shell" },
          { name: "zsh", description: "Zsh shell" },
          { name: "fish", description: "Fish shell" },
        ],
      },
    },
    {
      name: "hook",
      description: "Output shell hook for cd integration",
      args: {
        name: "shell",
        suggestions: [
          { name: "bash", description: "Bash shell" },
          { name: "zsh", description: "Zsh shell" },
          { name: "fish", description: "Fish shell" },
        ],
      },
    },
    {
      name: "version",
      description: "Show version information",
    },
  ],
  options: [
    {
      name: ["-h", "--help"],
      description: "Show help",
      isPersistent: true,
    },
    {
      name: ["-v", "--version"],
      description: "Show version",
    },
  ],
};

export default completionSpec;