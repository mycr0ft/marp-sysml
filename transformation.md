---
marp: true
theme: default
paginate: true
footer: "SysML v2 Transformation & Utilization — INCOSE/OMG webinar"
---

<!-- _class: lead -->

# From SysML v1 to SysML v2

## A clean-room transformation & utilization toolchain

**uml2py + sysmlpy** — OMG-normative, stdlib-Python, validated end to end

*INCOSE / OMG webinar*

---

## The migration problem

- Thousands of production **SysML v1** models live inside vendor tools
- SysML v2 is **not** a profile bump — it is a new language (KerML + SysML)
  with a new metamodel, new notation, new interchange
- OMG publishes the answer: **SysML v2.0 Beta 4, Part 2 —
  *SysML v1 to SysML v2 Transformation*** (ptc/2025-04-07)
- The question for this webinar: *how do I actually use it?*

---

## This talk in one slide

```sysml
package VehicleExample {
  part def Vehicle {
    part wheels[1..4] : Wheel;
    attribute mass : Kilogram;
    port pwr : PowerIf;
  }
  requirement <'R-1'> CarIsVehicle {
    doc /* A car shall be a specialization of vehicle. */
  }
  verification def CheckMass {
    objective obj_CheckMass { verify CarIsVehicle; }
  }
}
```

Every line here was **emitted by the toolchain** and **parsed by the
authoritative v2 reader** — no hand-tuning.

---

## The conformance chain (R1 → R3 → R2)

| | OMG clause | Our artifact |
|---|---|---|
| **R1** | read a SysML v1 model representation | `xmi21.py` + `mdzip_import.py` → UML 2.5.1 objects |
| **R3** | transform v1 abstract syntax → v2 abstract syntax | `v1_to_v2.py` (textual) + `v1_to_v2_as.py` (AS graph) |
| **R2** | SysML v2 abstract-syntax representation | `gen/sysml2.py` — generated from the OMG normative CMOF XMI |

One chain: **file → R1 objects → transformer → R2 AS graph → textual notation → validated**

---

## Clean-room discipline

- Written from **normative OMG text only**:
  UML 2.5.1 XMI, SysML profile XMI, BPMN20.cmof, the SysML v2 CMOF,
  ptc/2025-04-07
- No vendor tooling, no leaked spec text, no copied grammars
- **The honesty rule**: an element with no normative mapping
  **raises `UnmappedFeature` naming the v1 metaclass**
  — the toolchain refuses to guess

```python
raise UnmappedFeature(
    "v1 ProxyPort has no normative mapping (7.8.7 Table 30; SYSML2_-329)")
```

---

## R1: reading v1 as it actually exists

Two input dialects, one engine:

- **XMI 2.1 / EMF instance files** — OMG-published corpora
  (DoDAFLibrary.xmi, MeasurementsLibrary.xmi)
- **MagicDraw/Cameo `.mdzip`** — zip of XML snapshots with 15 years of
  dialect archaeology

```text
.mdzip → scrape → merge delta snapshots (keep-last dedup)
       → retag NoMagic's XMI-2.0/xsi spellings
       → inject xmi:type (metamodel-as-map coercion)
       → scrub cross-project refs to synthetic markers
       → read_xmi21 → gen.uml25 objects
```

12/12 files in the stress corpus (2015-era → 2024x-era) import without
hand-holding.

---

## R3: the transformation mappings

Every mapping is anchored to the published document:

| SysML v1 | SysML v2 | Anchor |
|---|---|---|
| Block | PartDefinition | 7.8.4.3.3 |
| Property (composite, block-typed) | PartUsage | 7.8.4.3.13 |
| ValueType | AttributeDefinition | 7.8.4.3.14 |
| ConstraintBlock | ConstraintDefinition | 7.8.5.3.1 |
| Connector | ConnectionUsage | 7.7.12.2.14 |
| BindingConnector | BindingConnectorAsUsage | 7.8.4.3.2 |
| Requirement | RequirementUsage | 7.8.8.3.30 |
| DeriveReqt | Derivation connection | 7.8.8.3.15 |
| TestCase / Verify | VerificationCaseDefinition + verification membership | 7.8.8.3.26/.49 |

…25+ more initializer mappings, plus activity/state/instance internals.

---

## Honesty has teeth: spec gaps surface, not vanish

```sysml
part def Controller {
  part fullPort : MotorIf {@PortData {isFullPort = true;}}
  port proxyPort;
  /* v1 ProxyPort has no normative mapping (7.8.7 Table 30; SYSML2_-329) */
  out attribute torque : Kilogram;
  in flowIn;
  inout ref occurrence flowRef : Axle;
}
```

- FullPort → PartUsage **annotated with PortData metadata** (7.8.7.3.7/.15)
- ProxyPort → base Port mapping + **explicit not-mapped comment**
  (Table 30 lists no target; issue SYSML2_-329)
- Elisions are *comments in the model*, not silent drops

---

## R2: the SysML v2 abstract syntax

- Generated from the **OMG normative CMOF XMI**: 175 classes
  (82 KerML + 93 SysML), 319 associations, 623 OCL constraints carried as
  metadata
- Runtime wiring is the normative ownership machinery:
  - `OwningMembership` — containment (KerML §7.3.2.3)
  - `FeatureMembership` — features of a Type (featuringType)
  - `FeatureTyping` — feature typing
  - `Subclassification` — specialization
- Derived unions (`ownedElement`, `feature`) computed live

---

## Validation: sysmlpy is the oracle

Every emitted textual form is parsed by
[sysmlpy](https://github.com/mycr0ft/sysmlpy) — the open-source SysML v2
reader — before it is considered done.

```
sysmlpy counts: {'package': 1, 'part': 5, 'attribute': 1,
 'enumeration': 1, 'port': 1, 'item': 1, 'state': 1, 'action': 1,
 'use_case': 2, 'requirement': 2, 'connection': 2, 'verification': 1,
 'metadata': 1, 'dependency': 3, 'allocation': 1}
```

Two independent implementations agreeing = the mapping is real,
not a dialect accident.

---

## Parity: two pipelines, one answer

The same v1 model through both paths:

```text
v1 model ──> textual emitter (v1_to_v2.py)   ──> SysML v2 text ─┐
                                                               ├─> identical
v1 model ──> AS transformer (v1_to_v2_as.py) ─> R2 AS graph      ┘
```

The AS graph renders to **byte-identical notation** with the textual
pipeline — checked, not hoped for.

**481 checks across 15 suites, all green.**

---

## Proof on a real OMG corpus

`DoDAFLibrary.xmi` (the OMG-published UPDM example) end to end:

```sysml
package <'DoDAF Class Library'> {
  /* v1 stereotype applied: StandardProfileL2::ModelLibrary */
  attribute def SecurityAttributes {
    doc /* W3C XML Schema for the Intelligence Community Metadata
           Standard for Information Security Marking (IC-ISM) */
    attribute classification : ClassificationType;
    attribute classifiedBy : String;
    ...
  }
}
```

V1 stereotypes surface as recorded applications — provenance travels with
the model.

---

## Beyond transformation: utilization

The same metamodel layer powers a full write path:

- **XMI 2.1/EMF instance writer** — round-trips both OMG dialects with
  canonical structural parity
- **CMOF + EMOF metamodel writers** — reconstructs OMG `BPMN20.cmof`
- **Stereotype & profile-application writing** — both UML 2.1 and
  2.5.1-era dialects
- **Normative derivations** (`derived.py`) — owners, qualified names,
  generalization closures, with spec OCL anchors

---

## Surviving vendor reality: diff & hash

TeamworkCloud churns `xmi:id`s on every save. Two defenses:

- **Semantic diff** (`mdzip_diff.py`) — flatten to
  (metaclass, qualified-path, feature) records; ids discarded by
  construction; match by path → moved → similarity
- **Semantic content hash** — model content hash that is invariant
  across tool upgrades (verified on real profile libraries: zero delta
  for unchanged models)

Compare *models*, not serialization noise.

---

## The wider MBSE toolchain

| Tool | Role |
|---|---|
| **sysmlpy** | authoritative v2 reader/parser — the validation oracle |
| **SysML-v2-Release** | official OMG release (spec + libraries) |
| **SysON** (podman compose) | web-based v2 modeling, lives off the same `.sysml` text |
| **SysML v2 Jupyter container** | notebook-driven analysis of v2 models |
| **VS Code SysML extension** | grammar source for this deck's highlighting |
| **sysml-v2-lsp** | language-server editing experience |

All of them speak **textual SysML v2** — which is exactly what the
transformation emits.

---

## A recipe you can run today

```bash
# 1. pull a v1 model out of a vendor tool
python mdzip_import.py project.mdzip        # or: xmi21 for .xmi

# 2. transform v1 -> v2
python -c "import v1_to_v2; print(v1_to_v2.emit_v2(model))"

# 3. validate with the authoritative reader
~/sysmlpy check: emitted text parses; counts per element kind

# 4. hand the .sysml text to the v2 ecosystem
#    (SysON, Jupyter, LSP editors, sysmlpy analyses)
```

Diffs across revisions: `mdzip_diff.py before.mdzip after.mdzip`.

---

## What "conformant" buys you

- **Traceability**: every emitted form cites its normative anchor
- **Predictability**: unmapped constructs are loud, not lossy
- **Interoperability**: output parses in the authoritative reader and in
  SysON/LSP tooling
- **Idempotence**: regenerating from unchanged inputs changes nothing
- **Vendor independence**: the pipeline is stdlib Python + OMG documents

---

## Current limits (the honest slide)

- AS-transformer wave A: core structural mappings
  (blocks/parts/attributes/enums/constraints/generalizations/docs)
- Later waves: behaviors, ports, state machines, requirements in the
  **AS graph** (already done in the *textual* pipeline)
- Multiplicities: carried in text; AS storage elided
  (derived-union bounds are not settable)
- Interactions: mapped-but-elided — the v2 *reader grammar* has no
  interaction element yet

---

<!-- _class: lead -->

## Takeaways

1. **Normative transformation is implementable** — in the open, from
   OMG documents, with a validation oracle
2. **v1 models are not stranded** — XMI and .mdzip both feed the chain
3. **Textual SysML v2 is the interchange medium** for the whole v2
   ecosystem
4. Honesty is a feature: `UnmappedFeature` > silent data loss

*Repo: `github.com/mycr0ft/uml2py` — reader, transformer, AS, writers,
diff — MIT licensed.*

---

## Thank you — questions?

- Toolchain: **uml2py** (transformation) + **sysmlpy** (validation)
- Spec anchors: OMG *SysML v2.0 Beta 4, Part 2* (ptc/2025-04-07)
- Deck built with Marp + Shiki + the VS Code SysML v2 grammar
- Try it: `git clone https://github.com/mycr0ft/uml2py && python3 check.py`
