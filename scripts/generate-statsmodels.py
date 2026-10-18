"""Independent scale references; these are NOT G*Power GUI observations."""
import csv
import json
import math
import platform
from pathlib import Path
import scipy
from scipy.stats import t
import statsmodels
from statsmodels.stats.power import TTestPower

model = TTestPower()
rows = []
for tails in [1, 2]:
    alternative = "larger" if tails == 1 else "two-sided"
    for dz in [.1, .15, .2, .3, .4, .5, .65, .8, 1., 1.5]:
        for alpha in [.01, .025, .05]:
            for target in [.6, .7, .8, .9, .95]:
                fractional = float(model.solve_power(effect_size=dz, alpha=alpha,
                    power=target, alternative=alternative))
                n = math.ceil(fractional)
                # Verify the integer threshold rather than trusting ceil alone.
                power_at = lambda k: float(model.power(dz, k, alpha, alternative=alternative))
                while power_at(n) < target:
                    n += 1
                while n > 2 and power_at(n - 1) >= target:
                    n -= 1
                for mode in ["a-priori", "post-hoc"]:
                    rows.append(dict(mode=mode, tails=tails, dz=dz, alpha=alpha,
                        power=target if mode == "a-priori" else "", n_input=n if mode == "post-hoc" else "",
                        fractional_n=fractional, expected_n=n, actual_power=power_at(n),
                        critical=float(t.ppf(1-alpha/tails,n-1)), df=n-1, ncp=dz*math.sqrt(n)))
path = Path("oracle/statsmodels-vectors.csv")
with path.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
Path("evidence/statsmodels-generation.json").write_text(json.dumps(dict(
    source="statsmodels TTestPower (not G*Power GUI)", count=len(rows),
    python=platform.python_version(), statsmodels=statsmodels.__version__, scipy=scipy.__version__,
    rounding="ceil fractional N, then verify power(N)>=target and power(N-1)<target",
    documentation="https://www.statsmodels.org/stable/generated/statsmodels.stats.power.TTestPower.html"
), indent=2)+"\n", encoding="utf-8")
print(f"Generated {len(rows)} statsmodels references")
