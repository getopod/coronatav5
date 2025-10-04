## Brief overview
  This set of guidelines covers efficient development workflow, task breakdown, and progress tracking to prevent forgotten tasks and unproductive loops.

## Task breakdown
  - Break large tasks into small, quick, manageable tasks for efficiency
  - Convert every user request into a todo list item to ensure nothing is forgotten, especially when multiple items are mentioned at once
  - Use the update_todo_list tool to maintain a clear, prioritized checklist of pending tasks
  - Mark tasks as completed only when fully accomplished, with no unresolved issues

## Loop detection and recovery
  - Monitor for repeated tool calls or edits that fail to make progress
  - When detecting a loop (e.g., multiple failed attempts at the same operation), pause and summarize the current state
  - Provide specific instructions or rephrase tasks if the model appears stuck in repetitive actions
  - Provide clear status updates and alternative approaches before proceeding
  - Avoid pointless back-and-forth conversations by focusing on actionable fixes

## Communication efficiency
  - Be direct and technical in responses, avoiding conversational fillers
  - Formulate final results without requiring further user input
  - Use tools proactively to gather necessary information rather than asking questions when possible