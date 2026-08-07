---
marp: true
theme: default
paginate: true
---

# SysML highlighting + Marp + Shiki 

Testing custom syntax highlighting for SysML v2.

---

## Vehicle Model

```sysml
package VehicleModel {
    import ScalarValues::*;

    part def Vehicle {
        attribute mass : Real;
        attribute maxSpeed : Real;

        part engine : Engine;
        part wheels : Wheel[4];

        port fuelPort : FuelPort;
    }

    part def Engine {
        attribute power : Real;

        action def start {
            in fuelLevel : Real;
        }
    }

    part def Wheel {
        attribute radius : Real;
    }

    part car : Vehicle {
        attribute :>> mass = 1500.0;
        attribute :>> maxSpeed = 220.0;
    }
}
```

---

## For comparison: Python

```python
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b
```

---

## Let's move forward with SysMLv2!


