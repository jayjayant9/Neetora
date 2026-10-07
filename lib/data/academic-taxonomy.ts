export interface SubjectTaxonomy {
  id: string;
  name: string;
  code: string;
  chapters: ChapterTaxonomy[];
}

export interface ChapterTaxonomy {
  id: string;
  name: string;
  classLevel: 11 | 12;
  topics: { id: string; name: string }[];
}

export const NEET_ACADEMIC_TAXONOMY: SubjectTaxonomy[] = [
  {
    id: "sub-phy",
    name: "Physics",
    code: "PHY",
    chapters: [
      {
        id: "ch-phy-01",
        name: "Units & Measurements",
        classLevel: 11,
        topics: [
          { id: "top-phy-01-1", name: "Dimensional Analysis" },
          { id: "top-phy-01-2", name: "Errors in Measurement" },
          { id: "top-phy-01-3", name: "SI Units & Significant Figures" },
        ],
      },
      {
        id: "ch-phy-02",
        name: "Kinematics & Motion in a Straight Line",
        classLevel: 11,
        topics: [
          { id: "top-phy-02-1", name: "Velocity & Acceleration" },
          { id: "top-phy-02-2", name: "Uniformly Accelerated Motion" },
          { id: "top-phy-02-3", name: "Relative Velocity" },
        ],
      },
      {
        id: "ch-phy-03",
        name: "Laws of Motion",
        classLevel: 11,
        topics: [
          { id: "top-phy-03-1", name: "Newton's Laws of Motion" },
          { id: "top-phy-03-2", name: "Friction & Angle of Repose" },
          { id: "top-phy-03-3", name: "Circular Motion Dynamics" },
        ],
      },
      {
        id: "ch-phy-04",
        name: "Electrostatics & Capacitance",
        classLevel: 12,
        topics: [
          { id: "top-phy-04-1", name: "Coulomb's Law & Electric Field" },
          { id: "top-phy-04-2", name: "Gauss's Law & Applications" },
          { id: "top-phy-04-3", name: "Electric Potential & Capacitors" },
        ],
      },
      {
        id: "ch-phy-05",
        name: "Current Electricity",
        classLevel: 12,
        topics: [
          { id: "top-phy-05-1", name: "Ohm's Law & Drift Velocity" },
          { id: "top-phy-05-2", name: "Kirchhoff's Laws & Wheatstone Bridge" },
          { id: "top-phy-05-3", name: "Potentiometer & Meter Bridge" },
        ],
      },
      {
        id: "ch-phy-06",
        name: "Magnetic Effects of Current",
        classLevel: 12,
        topics: [
          { id: "top-phy-06-1", name: "Biot-Savart Law & Ampere's Law" },
          { id: "top-phy-06-2", name: "Lorentz Force & Moving Charges" },
          { id: "top-phy-06-3", name: "Torque on Current Loop & Galvanometer" },
        ],
      },
    ],
  },
  {
    id: "sub-chem",
    name: "Chemistry",
    code: "CHEM",
    chapters: [
      {
        id: "ch-chem-01",
        name: "Some Basic Concepts of Chemistry (Mole Concept)",
        classLevel: 11,
        topics: [
          { id: "top-chem-01-1", name: "Mole Concept & Molar Mass" },
          { id: "top-chem-01-2", name: "Stoichiometry & Limiting Reagent" },
          { id: "top-chem-01-3", name: "Molarity, Molality, Mole Fraction" },
        ],
      },
      {
        id: "ch-chem-02",
        name: "Structure of Atom",
        classLevel: 11,
        topics: [
          { id: "top-chem-02-1", name: "Bohr Model & Hydrogen Spectrum" },
          { id: "top-chem-02-2", name: "de Broglie & Heisenberg Principle" },
          { id: "top-chem-02-3", name: "Quantum Numbers & Electronic Config" },
        ],
      },
      {
        id: "ch-chem-03",
        name: "Chemical Bonding & Molecular Structure",
        classLevel: 11,
        topics: [
          { id: "top-chem-03-1", name: "VSEPR Theory & Shapes" },
          { id: "top-chem-03-2", name: "Hybridization ($sp, sp^2, sp^3$)" },
          { id: "top-chem-03-3", name: "Molecular Orbital Theory (MOT)" },
        ],
      },
      {
        id: "ch-chem-04",
        name: "Chemical Thermodynamics",
        classLevel: 11,
        topics: [
          { id: "top-chem-04-1", name: "First Law, Enthalpy & Heat Capacity" },
          { id: "top-chem-04-2", name: "Hess's Law of Constant Heat Summation" },
          { id: "top-chem-04-3", name: "Entropy & Gibbs Free Energy" },
        ],
      },
      {
        id: "ch-chem-05",
        name: "Aldehydes, Ketones & Carboxylic Acids",
        classLevel: 12,
        topics: [
          { id: "top-chem-05-1", name: "Nucleophilic Addition Reactions" },
          { id: "top-chem-05-2", name: "Aldol Condensation & Cannizzaro" },
          { id: "top-chem-05-3", name: "Acidity of Carboxylic Acids" },
        ],
      },
    ],
  },
  {
    id: "sub-bot",
    name: "Botany",
    code: "BOT",
    chapters: [
      {
        id: "ch-bot-01",
        name: "Cell: The Unit of Life",
        classLevel: 11,
        topics: [
          { id: "top-bot-01-1", name: "Prokaryotic vs Eukaryotic Cells" },
          { id: "top-bot-01-2", name: "Endomembrane System" },
          { id: "top-bot-01-3", name: "Mitochondria, Chloroplast & Ribosomes" },
        ],
      },
      {
        id: "ch-bot-02",
        name: "Photosynthesis in Higher Plants",
        classLevel: 11,
        topics: [
          { id: "top-bot-02-1", name: "Light Reactions & Photophosphorylation" },
          { id: "top-bot-02-2", name: "Calvin Cycle (C3 Pathway)" },
          { id: "top-bot-02-3", name: "C4 Pathway & Photorespiration" },
        ],
      },
      {
        id: "ch-bot-03",
        name: "Principles of Inheritance and Variation",
        classLevel: 12,
        topics: [
          { id: "top-bot-03-1", name: "Mendelian Laws & Monohybrid/Dihybrid" },
          { id: "top-bot-03-2", name: "Incomplete Dominance & Co-dominance" },
          { id: "top-bot-03-3", name: "Linkage, Recombination & Sex Determination" },
        ],
      },
      {
        id: "ch-bot-04",
        name: "Molecular Basis of Inheritance",
        classLevel: 12,
        topics: [
          { id: "top-bot-04-1", name: "DNA Structure & Replication" },
          { id: "top-bot-04-2", name: "Transcription & Genetic Code" },
          { id: "top-bot-04-3", name: "Translation & Lac Operon" },
        ],
      },
    ],
  },
  {
    id: "sub-zoo",
    name: "Zoology",
    code: "ZOO",
    chapters: [
      {
        id: "ch-zoo-01",
        name: "Breathing and Exchange of Gases",
        classLevel: 11,
        topics: [
          { id: "top-zoo-01-1", name: "Respiratory Volumes and Capacities" },
          { id: "top-zoo-01-2", name: "Transport of Oxygen and $\\text{CO}_2$" },
          { id: "top-zoo-01-3", name: "Regulation & Disorders of Respiration" },
        ],
      },
      {
        id: "ch-zoo-02",
        name: "Body Fluids and Circulation",
        classLevel: 11,
        topics: [
          { id: "top-zoo-02-1", name: "Blood Groups & Coagulation" },
          { id: "top-zoo-02-2", name: "Cardiac Cycle & ECG" },
          { id: "top-zoo-02-3", name: "Double Circulation & Blood Pressure" },
        ],
      },
      {
        id: "ch-zoo-03",
        name: "Human Reproduction",
        classLevel: 12,
        topics: [
          { id: "top-zoo-03-1", name: "Spermatogenesis & Oogenesis" },
          { id: "top-zoo-03-2", name: "Menstrual Cycle & Hormonal Control" },
          { id: "top-zoo-03-3", name: "Fertilization, Implantation & Pregnancy" },
        ],
      },
      {
        id: "ch-zoo-04",
        name: "Human Health and Disease",
        classLevel: 12,
        topics: [
          { id: "top-zoo-04-1", name: "Infectious Diseases (Malaria, Typhoid)" },
          { id: "top-zoo-04-2", name: "Innate & Acquired Immunity, Antibodies" },
          { id: "top-zoo-04-3", name: "AIDS, Cancer & Drug Abuse" },
        ],
      },
    ],
  },
];
