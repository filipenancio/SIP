# utils/power_calculations.py
def format_complex_number(c: complex):
    return {
        "real": round(c.real, 4),
        "imag": round(c.imag, 4),
        "magnitude": round(abs(c), 4),
        "angle_deg": round(c.imag / c.real if c.real else 0, 4)
    }
