import json

with open(r'D:\AttentiaAi\model\ModelWithSim.ipynb', 'r') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        if any('class child:' in line for line in source):
            new_source = []
            for line in source:
                if 'self.knowledge_gain = 0 # postive reward' in line:
                    new_source.append(line)
                    new_source.append('        self.recent_knowledge_gain = 0\n')
                elif 'min(max(self.current_gain_capability, 0), 4)' in line:
                    new_source.append('            min(max(self.recent_knowledge_gain, 0), 4)\n')
                elif 'self.elapse_time()' in line:
                    new_source.append(line)
                    new_source.append('        self.recent_knowledge_gain = self.knowledge_gain\n')
                elif 'reward += self.knowledge_gain * 2' in line:
                    new_source.append('        reward += self.knowledge_gain * 10\n')
                else:
                    new_source.append(line)
            cell['source'] = new_source

with open(r'D:\AttentiaAi\model\ModelWithSim.ipynb', 'w') as f:
    json.dump(nb, f, indent=1)
print("Notebook updated successfully.")
