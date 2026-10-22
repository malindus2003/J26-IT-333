import json

with open(r'C:\Users\Asus\.gemini\antigravity\brain\ce1c6b8d-79e3-4515-aab6-8edbbfb82d78\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        s = str(obj)
        if 'cand_rice_018' in s:
            print(f"Step {obj.get('step_index')}, Type: {obj.get('type')}")
            if 'thinking' in obj:
                print("Thinking preview:", obj['thinking'][:200])
            if 'content' in obj:
                print("Content preview:", str(obj['content'])[:200])
