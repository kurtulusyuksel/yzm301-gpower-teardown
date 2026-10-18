"""
Oracle Generator for G*Power 3.1.9.7: Difference between two dependent means (matched pairs)
Generates benchmark oracle vectors covering a-priori, post-hoc, 1-tailed, 2-tailed,
small/medium/large effect sizes, boundary conditions, and extreme values.
"""

import csv
import math
import scipy.stats as st

def solve_paired_a_priori(tails, dz, alpha, target_power):
    for N in range(2, 200000):
        df = N - 1
        delta = dz * math.sqrt(N)
        if tails == 1:
            crit = st.t.ppf(1.0 - alpha, df)
            power = 1.0 - st.nct.cdf(crit, df, delta)
        else:
            crit = st.t.ppf(1.0 - alpha / 2.0, df)
            power = 1.0 - st.nct.cdf(crit, df, delta) + st.nct.cdf(-crit, df, delta)
        if power >= target_power:
            return N, round(power, 4), round(crit, 4), df, round(delta, 4)
    return None

def solve_paired_post_hoc(tails, dz, alpha, N):
    df = N - 1
    delta = dz * math.sqrt(N)
    if tails == 1:
        crit = st.t.ppf(1.0 - alpha, df)
        power = 1.0 - st.nct.cdf(crit, df, delta)
    else:
        crit = st.t.ppf(1.0 - alpha / 2.0, df)
        power = 1.0 - st.nct.cdf(crit, df, delta) + st.nct.cdf(-crit, df, delta)
    return N, round(power, 4), round(crit, 4), df, round(delta, 4)

def main():
    rows = []
    
    # 1. Standard Clinical Benchmarks (A-priori, 2-tailed)
    for dz in [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0]:
        for power in [0.80, 0.85, 0.90, 0.95]:
            for alpha in [0.05, 0.01]:
                res = solve_paired_a_priori(2, dz, alpha, power)
                if res:
                    rows.append({
                        'category': 'standard_a_priori_2tailed',
                        'mode': 'a-priori',
                        'tails': 2,
                        'dz': dz,
                        'alpha': alpha,
                        'power': power,
                        'n_input': '',
                        'expected_n': res[0],
                        'actual_power': res[1],
                        'critical': res[2],
                        'df': res[3],
                        'ncp': res[4]
                    })

    # 2. Standard Directional Benchmarks (A-priori, 1-tailed)
    for dz in [0.2, 0.35, 0.5, 0.75, 0.9]:
        for power in [0.80, 0.90, 0.95]:
            res = solve_paired_a_priori(1, dz, 0.05, power)
            if res:
                rows.append({
                    'category': 'standard_a_priori_1tailed',
                    'mode': 'a-priori',
                    'tails': 1,
                    'dz': dz,
                    'alpha': 0.05,
                    'power': power,
                    'n_input': '',
                    'expected_n': res[0],
                    'actual_power': res[1],
                    'critical': res[2],
                    'df': res[3],
                    'ncp': res[4]
                })

    # 3. Post-Hoc Analysis Benchmarks
    for N in [10, 20, 30, 45, 54, 80, 120, 200]:
        for dz in [0.3, 0.5, 0.8]:
            res = solve_paired_post_hoc(2, dz, 0.05, N)
            rows.append({
                'category': 'post_hoc_benchmarks',
                'mode': 'post-hoc',
                'tails': 2,
                'dz': dz,
                'alpha': 0.05,
                'power': '',
                'n_input': N,
                'expected_n': res[0],
                'actual_power': res[1],
                'critical': res[2],
                'df': res[3],
                'ncp': res[4]
            })

    # 4. Boundary & Extreme Cases
    # Small effect size dz = 0.05, high power
    b1 = solve_paired_a_priori(2, 0.05, 0.05, 0.80)
    rows.append({
        'category': 'boundary_small_dz',
        'mode': 'a-priori',
        'tails': 2,
        'dz': 0.05,
        'alpha': 0.05,
        'power': 0.80,
        'n_input': '',
        'expected_n': b1[0],
        'actual_power': b1[1],
        'critical': b1[2],
        'df': b1[3],
        'ncp': b1[4]
    })
    
    # Large effect size dz = 2.5
    b2 = solve_paired_a_priori(2, 2.5, 0.05, 0.95)
    rows.append({
        'category': 'boundary_large_dz',
        'mode': 'a-priori',
        'tails': 2,
        'dz': 2.5,
        'alpha': 0.05,
        'power': 0.95,
        'n_input': '',
        'expected_n': b2[0],
        'actual_power': b2[1],
        'critical': b2[2],
        'df': b2[3],
        'ncp': b2[4]
    })

    # Minimal sample size post-hoc: N = 2
    b3 = solve_paired_post_hoc(2, 0.5, 0.05, 2)
    rows.append({
        'category': 'boundary_min_n',
        'mode': 'post-hoc',
        'tails': 2,
        'dz': 0.5,
        'alpha': 0.05,
        'power': '',
        'n_input': 2,
        'expected_n': b3[0],
        'actual_power': b3[1],
        'critical': b3[2],
        'df': b3[3],
        'ncp': b3[4]
    })

    out_file = "oracle/vectors.csv"
    fieldnames = [
        'category', 'mode', 'tails', 'dz', 'alpha', 'power', 'n_input',
        'expected_n', 'actual_power', 'critical', 'df', 'ncp'
    ]
    with open(out_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Successfully generated {len(rows)} oracle vectors into {out_file}")

if __name__ == '__main__':
    main()
