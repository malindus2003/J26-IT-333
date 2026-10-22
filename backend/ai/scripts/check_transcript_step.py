import json

with open(r'C:\Users\Asus\.gemini\antigravity\brain\ce1c6b8d-79e3-4515-aab6-8edbbfb82d78\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        if obj.get('step_index') in [1177, 1243]:
            print(f"=== STEP {obj.get('step_index')} ===")
            print("THINKING:", obj.get('thinking', '')[:1000])
            print("TOOL CALLS:", obj.get('tool_calls'))
