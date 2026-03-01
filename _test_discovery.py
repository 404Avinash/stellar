import urllib.request, json
r = urllib.request.urlopen('http://localhost:5000/api/discovery?page=1&per_page=3')
d = json.loads(r.read())
print("=== METADATA ===")
for k in ['total_candidates','classified','total_filtered','page','pages']:
    print(f"  {k}: {d[k]}")
print("\n=== SUMMARY ===")
s = d['summary']
print(f"  confirmed_predictions: {s['confirmed_predictions']}")
print(f"  false_positive_predictions: {s['false_positive_predictions']}")
print(f"  habitable_zone: {s['habitable_zone']}")
print(f"  avg_priority_score: {s['avg_priority_score']}")
print(f"  priority_dist: {s['priority_distribution']}")
print(f"\n  Role breakdown:")
for rb in s['role_breakdown']:
    print(f"    {rb['role']}: {rb['count']} ({rb['percentage']}%)")
print("\n=== TOP CANDIDATE ===")
c = d['data'][0]
print(f"  prediction: {c['prediction']}")
print(f"  conf_prob: {c['confirmation_probability']}")
print(f"  radius: {c['predicted_radius']}")
print(f"  planet_class: {c['planet_class']}")
print(f"  in_hz: {c['in_habitable_zone']}")
print(f"  priority_score: {c['priority_score']}")
print(f"  num_roles: {c['num_roles']}")
for a in c['role_assignments']:
    print(f"\n  --- {a['role']} [{a['priority']}] ---")
    print(f"  Instrument: {a['instrument']}")
    print(f"  Task: {a['task']}")
    print(f"  Reason: {a['reason'][:120]}...")
