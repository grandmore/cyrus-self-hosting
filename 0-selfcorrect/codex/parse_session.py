#!/usr/bin/env python3
"""
Parse Codex session JSONL file into readable markdown conversation document.
"""
import json
import sys
from datetime import datetime
from pathlib import Path

def parse_session(jsonl_path: str, output_path: str):
    """Parse JSONL session file and create markdown document."""

    with open(jsonl_path, 'r') as f:
        lines = f.readlines()

    conversation = []
    session_meta = None
    current_user_message = None
    current_assistant_response = []
    current_reasoning = []

    for line in lines:
        try:
            data = json.loads(line)
            msg_type = data.get('type')
            payload = data.get('payload', {})

            # Extract session metadata
            if msg_type == 'session_meta':
                session_meta = payload

            # Extract user messages
            elif msg_type == 'response_item' and payload.get('role') == 'user':
                content_list = payload.get('content', [])
                for content_item in content_list:
                    if content_item.get('type') == 'input_text':
                        text = content_item.get('text', '')
                        # Skip environment context messages
                        if '<environment_context>' not in text:
                            current_user_message = text

            # Extract agent reasoning
            elif msg_type == 'event_msg' and payload.get('type') == 'agent_reasoning':
                reasoning_text = payload.get('text', '')
                if reasoning_text:
                    current_reasoning.append(reasoning_text)

            # Extract function call outputs (tool results)
            elif msg_type == 'response_item' and payload.get('type') == 'function_call_output':
                output_data = json.loads(payload.get('output', '{}'))
                output_text = output_data.get('output', '')
                if output_text and len(output_text) > 50:  # Only substantial outputs
                    # Truncate very long outputs
                    if len(output_text) > 2000:
                        output_text = output_text[:2000] + '\n\n[... output truncated ...]'
                    current_assistant_response.append(f"```\n{output_text}\n```")

            # When we hit a token_count event after user message, save the turn
            elif msg_type == 'event_msg' and payload.get('type') == 'token_count':
                if current_user_message:
                    # Save the conversation turn
                    conversation.append({
                        'role': 'user',
                        'content': current_user_message,
                        'reasoning': current_reasoning[:],
                        'response': current_assistant_response[:]
                    })
                    current_user_message = None
                    current_reasoning = []
                    current_assistant_response = []

        except json.JSONDecodeError:
            continue
        except Exception as e:
            print(f"Warning: Error processing line: {e}", file=sys.stderr)
            continue

    # Generate markdown
    md_lines = []
    md_lines.append("# Codex Conversation Transcript")
    md_lines.append("")

    if session_meta:
        md_lines.append("## Session Information")
        md_lines.append("")
        md_lines.append(f"- **Session ID**: `{session_meta.get('id')}`")
        md_lines.append(f"- **Started**: {session_meta.get('timestamp')}")
        md_lines.append(f"- **Working Directory**: `{session_meta.get('cwd')}`")
        md_lines.append(f"- **Model**: {session_meta.get('model_provider')}")

        git_info = session_meta.get('git', {})
        if git_info:
            md_lines.append(f"- **Git Branch**: {git_info.get('branch')}")
            md_lines.append(f"- **Git Commit**: `{git_info.get('commit_hash')[:8]}`")

        md_lines.append("")
        md_lines.append("---")
        md_lines.append("")

    md_lines.append("## Conversation")
    md_lines.append("")

    for i, turn in enumerate(conversation, 1):
        md_lines.append(f"### Turn {i}")
        md_lines.append("")

        # User message
        md_lines.append("**User:**")
        md_lines.append("")
        md_lines.append(turn['content'])
        md_lines.append("")

        # Assistant reasoning
        if turn['reasoning']:
            md_lines.append("**Assistant Reasoning:**")
            md_lines.append("")
            for reasoning in turn['reasoning']:
                md_lines.append(f"- {reasoning}")
            md_lines.append("")

        # Assistant response
        if turn['response']:
            md_lines.append("**Assistant Actions/Output:**")
            md_lines.append("")
            for response in turn['response']:
                md_lines.append(response)
                md_lines.append("")

        md_lines.append("---")
        md_lines.append("")

    # Write markdown file
    with open(output_path, 'w') as f:
        f.write('\n'.join(md_lines))

    print(f"✓ Parsed {len(conversation)} conversation turns")
    print(f"✓ Saved to: {output_path}")

if __name__ == '__main__':
    session_file = Path.home() / '.codex/sessions/2025/11/03/rollout-2025-11-03T19-17-08-019a4b26-da02-7e61-8777-4d56eb504b2d.jsonl'
    output_file = '/Users/stuartfenton/docker/claude-code-mcp-advanced/0-selfcorrect/codex/02-conversation.md'

    if not session_file.exists():
        print(f"Error: Session file not found: {session_file}")
        sys.exit(1)

    parse_session(str(session_file), output_file)
