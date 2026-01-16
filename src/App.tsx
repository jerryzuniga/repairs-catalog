import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  LayoutGrid,
  Home,
  ChevronRight,
  ChevronDown,
  Info,
  Download,
  Printer,
  Shield,
  Heart,
  Zap,
  Users,
  ArrowRight,
  Layers,
  GraduationCap,
  Activity,
  MousePointerClick,
  Ban,
  Hammer,
  Circle,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

// --- Types & Interfaces ---

type ViewState = 'landing' | 'learn' | 'catalog' | 'report';

interface Intervention {
  id: string;
  name: string;
  urgency: string;
  condition: string;
  pillarId?: string;
  pillarName?: string;
  subCatId?: string;
  subCatName?: string;
  typeId?: string;
  typeName?: string;
  pillarDescription?: string;
  subCatDescription?: string;
  typeDescription?: string;
}

interface Type {
  id: string;
  name: string;
  description?: string;
  interventions: Intervention[];
}

interface SubCategory {
  id: string;
  name: string;
  description: string;
  types: Type[];
}

interface Pillar {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  subCategories: SubCategory[];
}

interface Selection {
  status?: 'eligible' | 'not_eligible' | 'conditional' | 'na';
  urgency?: string;
  condition?: string;
  notes?: string;
}

interface SelectionsMap {
  [key: string]: Selection;
}

interface ExportConfig {
  format: 'csv' | 'pdf' | 'image';
  levels: {
    pillar: boolean;
    subCategory: boolean;
    type: boolean;
    activity: boolean;
  };
  elements: {
    definitions: boolean;
    criticality: boolean;
    notes: boolean;
  };
}

interface ReportViewProps {
  selections: SelectionsMap;
  onHome: () => void;
  view: ViewState;
  setView: (v: ViewState) => void;
}

// --- Brand Colors ---
// Primary
const C_BRIGHT_BLUE = 'text-[#0099CC]';
// Secondary
const C_TRAD_GREEN = 'text-[#3AA047]';
const C_ORANGE = 'text-[#E55025]';
const C_RED = 'text-[#A4343A]';

// --- Assets ---
const LOGO_URL = 'https://github.com/jerryzuniga/repairs-catalog/blob/fd2b835413161d9a35a156dbe830f8ecc911531f/public/catalog.png?raw=true';

// --- Mock Data: Taxonomy Framework ---
const TAXONOMY_DATA: Pillar[] = [
  {
    id: 'p1',
    name: 'Dwelling Safety',
    icon: Shield,
    color: C_RED,
    bgColor: 'bg-[#A4343A]/10',
    description: 'Focuses on immediate threats to the structure and safety of occupants.',
    subCategories: [
      {
        id: 'sc1',
        name: 'Structural Components',
        description: 'Restores the home’s essential structural integrity to meet minimum building safety standards by addressing active, critical issues that could lead to immediate failure or unsafe living conditions.',
        types: [
          {
            id: 'sct1',
            name: 'Structural Flooring / Foundation',
            description: 'Repairs that maintain the structural stability and integrity of the home’s foundation and flooring systems.',
            interventions: [
              { id: 'i101', name: 'Repair/replace deteriorated floor joists', urgency: 'Critical', condition: 'Active' },
              { id: 'i102', name: 'Stabilize piers and footings', urgency: 'Critical', condition: 'Active' },
              { id: 'i103', name: 'Level uneven concrete slabs', urgency: 'Critical', condition: 'Active' },
              { id: 'i104', name: 'Repair/replace cracked foundations', urgency: 'Critical', condition: 'Active' },
              { id: 'i105', name: 'Shore up failing crawl spaces', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct2',
            name: 'Structural Roofing',
            description: 'Repairs or replacements necessary to maintain the basic structural integrity of the roof and prevent collapse or accelerate deterioration.',
            interventions: [
              { id: 'i106', name: 'Reinforce/replace compromised trusses', urgency: 'Critical', condition: 'Active' },
              { id: 'i107', name: 'Fix sagging roof supports', urgency: 'Critical', condition: 'Active' },
              { id: 'i108', name: 'Repair deteriorated roof decking', urgency: 'Critical', condition: 'Active' },
              { id: 'i109', name: 'Stabilize roof beams', urgency: 'Critical', condition: 'Active' },
              { id: 'i110', name: 'Address major rot in rafters', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct3',
            name: 'Structural Walls',
            description: 'Repairs to load-bearing and external walls required to restore basic structural integrity and prevent collapse or accelerate deterioration.',
            interventions: [
              { id: 'i111', name: 'Reinforce bowing load-bearing walls', urgency: 'Critical', condition: 'Active' },
              { id: 'i112', name: 'Repair failing wall studs', urgency: 'Critical', condition: 'Active' },
              { id: 'i113', name: 'Address termite/moisture structural damage', urgency: 'Critical', condition: 'Active' },
              { id: 'i114', name: 'Replace damaged wall plates', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct4',
            name: 'Non-unit Structural Repairs',
            description: 'Structural interventions necessary for outbuildings, retaining walls, or other non-living unit structures that are essential for the stability and safety of the property as a whole.',
            interventions: [
              { id: 'i115', name: 'Stabilize retaining walls', urgency: 'Critical', condition: 'Active' },
              { id: 'i116', name: 'Repair compromised garages/sheds', urgency: 'Critical', condition: 'Active' },
              { id: 'i117', name: 'Reinforce external storage structures', urgency: 'Critical', condition: 'Active' },
              { id: 'i118', name: 'Fix structural failures in carports', urgency: 'Critical', condition: 'Active' }
            ]
          }
        ]
      },
      {
        id: 'sc2',
        name: 'Essential Home Systems (EHS)',
        description: 'Addresses urgent, active failures in essential operational systems (e.g., HVAC, electrical, plumbing) necessary for maintaining safety, habitability, and basic home functionality.',
        types: [
          {
            id: 'sct5',
            name: 'EHS Roofing - Replacement',
            description: 'Full replacement of roofing systems that are in critical condition, posing immediate risks such as leaks, structural damage, or compromised safety.',
            interventions: [
              { id: 'i119', name: 'Complete shingle replacement', urgency: 'Critical', condition: 'Active' },
              { id: 'i120', name: 'Reinstall underlayment', urgency: 'Critical', condition: 'Active' },
              { id: 'i121', name: 'Full tear-off and reroof', urgency: 'Critical', condition: 'Active' },
              { id: 'i122', name: 'Upgrade to impact-resistant shingles', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct6',
            name: 'EHS Roofing - Repair',
            description: 'Repairs to damaged roofing components that are essential to prevent water intrusion, structural failure, or other significant risks to the home.',
            interventions: [
              { id: 'i123', name: 'Repair damaged flashing', urgency: 'Critical', condition: 'Active' },
              { id: 'i124', name: 'Fix roof valleys', urgency: 'Critical', condition: 'Active' },
              { id: 'i125', name: 'Patch missing shingles', urgency: 'Critical', condition: 'Active' },
              { id: 'i126', name: 'Seal active leaks', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct7',
            name: 'EHS Wall Systems',
            description: 'Repair or replacement of wall components, both interior and exterior, that are critical to maintaining structural integrity, safety, and habitability.',
            interventions: [
              { id: 'i127', name: 'Replace compromised siding', urgency: 'Critical', condition: 'Active' },
              { id: 'i128', name: 'Minimum siding repair standards', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct8',
            name: 'EHS HVAC',
            description: 'Repairs or replacements necessary for heating, ventilation, and air conditioning systems that ensure safe indoor temperatures, proper ventilation, and air quality.',
            interventions: [
              { id: 'i129', name: 'Replace inoperable furnace/AC', urgency: 'Critical', condition: 'Active' },
              { id: 'i130', name: 'Repair damaged ductwork', urgency: 'Critical', condition: 'Active' },
              { id: 'i131', name: 'Fix malfunctioning thermostat', urgency: 'Critical', condition: 'Active' },
              { id: 'i132', name: 'Install new air filtration', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct9',
            name: 'EHS Electrical',
            description: 'Electrical system repairs or upgrades addressing immediate safety concerns or severe deficiencies that pose risks of fire, electrocution, or system failures.',
            interventions: [
              { id: 'i133', name: 'Upgrade sub-standard panels', urgency: 'Critical', condition: 'Active' },
              { id: 'i134', name: 'Rewire unsafe circuits', urgency: 'Critical', condition: 'Active' },
              { id: 'i135', name: 'Replace malfunctioning outlets', urgency: 'Critical', condition: 'Active' },
              { id: 'i136', name: 'Install grounding systems', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct10',
            name: 'EHS Plumbing',
            description: 'Essential repairs to water, sewage, and gas supply systems that address active failures or risks that directly impact health and safety.',
            interventions: [
              { id: 'i137', name: 'Fix burst water pipes', urgency: 'Critical', condition: 'Active' },
              { id: 'i138', name: 'Repair severe sewer backups', urgency: 'Critical', condition: 'Active' },
              { id: 'i139', name: 'Address gas leaks', urgency: 'Critical', condition: 'Active' },
              { id: 'i140', name: 'Replace corroded pipes', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct11',
            name: 'EHS Flooring',
            description: 'Repairs to floors that have become unstable, unsafe, or compromised due to issues like rot, water damage, or subfloor failure.',
            interventions: [
              { id: 'i141', name: 'Replace rotted subfloors', urgency: 'Critical', condition: 'Active' },
              { id: 'i142', name: 'Fix buckling floors', urgency: 'Critical', condition: 'Active' },
              { id: 'i143', name: 'Install moisture barriers', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct12',
            name: 'EHS Walkways / Decks / Steps',
            description: 'Repairs to exterior pathways that address safety hazards, such as instability, collapse risks, or severe trip hazards, ensuring safe movement across the property.',
            interventions: [
              { id: 'i144', name: 'Rebuild deteriorated steps', urgency: 'Critical', condition: 'Active' },
              { id: 'i145', name: 'Reinforce weak deck structures', urgency: 'Critical', condition: 'Active' },
              { id: 'i146', name: 'Replace crumbling walkways', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct13',
            name: 'EHS Water Heater',
            description: 'Replacement or repair of water heaters that are non-functional or failing, resulting in unreliable hot water supply critical for daily living.',
            interventions: [
              { id: 'i147', name: 'Install new water heater', urgency: 'Critical', condition: 'Active' },
              { id: 'i148', name: 'Replace leaking unit', urgency: 'Critical', condition: 'Active' },
              { id: 'i149', name: 'Fix heating element', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct14',
            name: 'EHS Doors & Windows',
            description: 'Repairs or replacements that address immediate safety, security, or severe weatherproofing issues, ensuring proper insulation, entry, and exit functionality.',
            interventions: [
              { id: 'i150', name: 'Replace shattered windows', urgency: 'Critical', condition: 'Active' },
              { id: 'i151', name: 'Repair broken locks', urgency: 'Critical', condition: 'Active' },
              { id: 'i152', name: 'Fix inoperable doors', urgency: 'Critical', condition: 'Active' }
            ]
          }
        ]
      },
      {
        id: 'sc3',
        name: 'Home Systems Maintenance (HSM)',
        description: 'Focuses on visible, active issues that are non-critical but need addressing to prevent deterioration into critical problems, maintaining long-term home stability.',
        types: [
          {
            id: 'sct15',
            name: 'HSM Plumbing & Water Heater',
            description: 'Repairs addressing active, non-critical plumbing and water heater issues that display visible symptoms of disrepair and, if left unattended, could escalate into critical problems.',
            interventions: [
              { id: 'i153', name: 'Fix dripping faucets', urgency: 'Emergent', condition: 'Active' },
              { id: 'i154', name: 'Replace corroded anode rod', urgency: 'Emergent', condition: 'Active' },
              { id: 'i155', name: 'Address clogged drains', urgency: 'Emergent', condition: 'Active' },
              { id: 'i156', name: 'Regulate water pressure', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct16',
            name: 'HSM Electrical',
            description: 'Addressing active electrical issues that present visible signs of disrepair but do not immediately threaten safety or function; these repairs prevent future critical failures.',
            interventions: [
              { id: 'i157', name: 'Replace worn switches/outlets', urgency: 'Emergent', condition: 'Active' },
              { id: 'i158', name: 'Fix flickering lights', urgency: 'Emergent', condition: 'Active' },
              { id: 'i159', name: 'Replace outdated fixtures', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct17',
            name: 'HSM Door and Window',
            description: 'Repairs to doors and windows showing visible signs of deterioration, such as drafts, alignment issues, or minor damage, that need attention before escalating into more serious problems.',
            interventions: [
              { id: 'i160', name: 'Re-align sagging doors', urgency: 'Emergent', condition: 'Active' },
              { id: 'i161', name: 'Seal drafty windows', urgency: 'Emergent', condition: 'Active' },
              { id: 'i162', name: 'Replace cracked panes', urgency: 'Emergent', condition: 'Active' },
              { id: 'i163', name: 'Re-caulk windows', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct18',
            name: 'HSM Exterior Paint',
            description: 'Addressing visible exterior paint damage that, while not immediately threatening the home’s integrity, can lead to more significant wear if neglected.',
            interventions: [
              { id: 'i164', name: 'Repaint peeling areas', urgency: 'Emergent', condition: 'Active' },
              { id: 'i165', name: 'Touch-up exposed wood', urgency: 'Emergent', condition: 'Active' },
              { id: 'i166', name: 'Seal exterior cracks', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct19',
            name: 'HSM Interior Paint',
            description: 'Repairs focusing on visible interior paint damage that could worsen over time if unaddressed, such as peeling, chipping, or staining.',
            interventions: [
              { id: 'i167', name: 'Repaint chipped/peeling walls', urgency: 'Emergent', condition: 'Active' },
              { id: 'i168', name: 'Cover visible stains', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct20',
            name: 'HSM Appliance',
            description: 'Repairing or replacing appliances with visible, active issues such as diminished efficiency, malfunctioning parts, or minor damage that can lead to complete breakdowns if left unattended.',
            interventions: [
              { id: 'i169', name: 'Repair refrigerator compressor', urgency: 'Emergent', condition: 'Active' },
              { id: 'i170', name: 'Replace cracked stove elements', urgency: 'Emergent', condition: 'Active' },
              { id: 'i171', name: 'Replace broken seals', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct21',
            name: 'HSM Cabinetry',
            description: 'Repairs to cabinetry that shows signs of active deterioration, such as misalignment, wear, or minor damage that, if left unaddressed, can impact functionality or lead to more significant repair needs.',
            interventions: [
              { id: 'i172', name: 'Re-align cabinet doors', urgency: 'Emergent', condition: 'Active' },
              { id: 'i173', name: 'Fix sticking drawers', urgency: 'Emergent', condition: 'Active' },
              { id: 'i174', name: 'Replace broken hinges', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct22',
            name: 'HSM Flooring',
            description: 'Addressing active flooring issues such as looseness, visible damage, or wear that, while not yet critical, can lead to safety hazards or more severe deterioration if not repaired.',
            interventions: [
              { id: 'i175', name: 'Secure loose tiles/boards', urgency: 'Emergent', condition: 'Active' },
              { id: 'i176', name: 'Repair cracked grout', urgency: 'Emergent', condition: 'Active' },
              { id: 'i177', name: 'Refinish scratched hardwood', urgency: 'Emergent', condition: 'Active' }
            ]
          },
          {
            id: 'sct23',
            name: 'HSM Exterior Decks/Walkways',
            description: 'Repairs focused on visible signs of wear or damage to exterior surfaces that, while not immediately hazardous, can worsen and create safety risks or structural issues if left untreated.',
            interventions: [
              { id: 'i178', name: 'Replace rotting deck boards', urgency: 'Emergent', condition: 'Active' },
              { id: 'i179', name: 'Fix loose railings', urgency: 'Emergent', condition: 'Active' },
              { id: 'i180', name: 'Fill concrete cracks', urgency: 'Emergent', condition: 'Active' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'p2',
    name: 'Occupant Health',
    icon: Heart,
    color: C_ORANGE,
    bgColor: 'bg-[#E55025]/10',
    description: 'Addresses environmental hazards and accessibility needs.',
    subCategories: [
      {
        id: 'sc4',
        name: 'Environmental Hazards Controls',
        description: 'Targets active environmental and architectural hazards directly impacting health and safety, requiring immediate attention to ensure healthy living conditions.',
        types: [
          {
            id: 'sct24',
            name: 'Respiratory Hazards',
            description: 'Controls and interventions targeting indoor air pollutants that can harm respiratory health, ensuring safe air quality for occupants.',
            interventions: [
              { id: 'i181', name: 'Ventilation controls', urgency: 'Critical', condition: 'Active' },
              { id: 'i182', name: 'Radon testing and remediation', urgency: 'Critical', condition: 'Active' },
              { id: 'i183', name: 'Air purifiers / cleaning', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct25',
            name: 'Chemical Hazards',
            description: 'Measures that address harmful chemicals present in the home, such as lead, asbestos, and other toxic substances, ensuring safe living conditions.',
            interventions: [
              { id: 'i184', name: 'Lead paint encapsulation', urgency: 'Critical', condition: 'Active' },
              { id: 'i185', name: 'Lead paint abatement (removal)', urgency: 'Critical', condition: 'Active' },
              { id: 'i186', name: 'Lead line replacement', urgency: 'Critical', condition: 'Active' },
              { id: 'i187', name: 'Asbestos encapsulation/abatement', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct26',
            name: 'Biological Hazards',
            description: 'Controls and remediation of biological contaminants that threaten health, such as mold, pests, and bio-waste, ensuring a sanitary living environment.',
            interventions: [
              { id: 'i188', name: 'Mold remediation', urgency: 'Critical', condition: 'Active' },
              { id: 'i189', name: 'Pest control', urgency: 'Critical', condition: 'Active' },
              { id: 'i190', name: 'Bio-waste cleanup', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct27',
            name: 'Environmental Hazards - Other',
            description: 'Controls addressing various structural or disasters not covered under more specific categories, including interventions that reduce risks from environmental conditions or structural dangers.',
            interventions: [
              { id: 'i191', name: 'Hazardous tree removal', urgency: 'Critical', condition: 'Active' },
              { id: 'i192', name: 'Structural hazard removal', urgency: 'Critical', condition: 'Active' }
            ]
          }
        ]
      },
      {
        id: 'sc5',
        name: 'Critical Accessibility / Fall Prevention',
        description: 'Provides essential modifications for individuals with mobility challenges, addressing active, emergent needs in key areas like ingress/egress, bathing, and movement to ensure safety and independence.',
        types: [
          {
            id: 'sct28',
            name: 'Critical Accessibility - Ingress/Egress',
            description: 'Systems and modifications that provide accessible entry and exit for individuals with mobility challenges, enabling easier movement across different levels of the home.',
            interventions: [
              { id: 'i193', name: 'Modular/temporary ramp system', urgency: 'Critical', condition: 'Active' },
              { id: 'i194', name: 'Permanent integrated ramp', urgency: 'Critical', condition: 'Active' },
              { id: 'i195', name: 'Stair lifts / Platform lifts', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct29',
            name: 'Critical Accessibility - Showering',
            description: 'Modifications and equipment that improve the safety and accessibility of bathing and showering areas, especially for those with limited mobility.',
            interventions: [
              { id: 'i196', name: 'Roll-in/Zero-barrier shower', urgency: 'Critical', condition: 'Active' },
              { id: 'i197', name: 'Tub cutout', urgency: 'Critical', condition: 'Active' },
              { id: 'i198', name: 'Lever shower controls', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct30',
            name: 'Critical Accessibility - Bathroom',
            description: 'Bathroom-specific interventions that improve accessibility, focusing on fixtures, controls, and layouts that cater to individuals with physical limitations.',
            interventions: [
              { id: 'i199', name: 'Pedestal/wall-mount sink', urgency: 'Critical', condition: 'Active' },
              { id: 'i200', name: 'Raised toilet/frames', urgency: 'Critical', condition: 'Active' },
              { id: 'i201', name: 'Non-slip mats', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct31',
            name: 'Fall Prevention - Grab Bars / Railings',
            description: 'Installation of support bars and railings in critical areas to reduce fall risks and provide additional stability for those with balance or mobility challenges.',
            interventions: [
              { id: 'i202', name: 'Grab bars (all locations)', urgency: 'Critical', condition: 'Active' },
              { id: 'i203', name: 'Interior stair railings', urgency: 'Critical', condition: 'Active' },
              { id: 'i204', name: 'Transfer poles', urgency: 'Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct32',
            name: 'Fall Prevention - Decks, Steps & Walkways',
            description: 'Interventions designed to minimize fall hazards in outdoor and transitional spaces by providing safe, stable, and accessible surfaces.',
            interventions: [
              { id: 'i205', name: 'Half-step systems', urgency: 'Critical', condition: 'Active' },
              { id: 'i206', name: 'Contrast step systems', urgency: 'Critical', condition: 'Active' },
              { id: 'i207', name: 'Exterior anti-slip treatment', urgency: 'Critical', condition: 'Active' }
            ]
          }
        ]
      },
      {
        id: 'sc6',
        name: 'Non-Critical Accessibility / Aging in Place',
        description: 'Includes active, non-critical interventions that support daily living and independence for aging residents, ensuring accessibility and convenience while addressing non-urgent needs.',
        types: [
          {
            id: 'sct33',
            name: 'Assistive Aids',
            description: 'Tools and devices designed to assist individuals with mobility, reaching, or daily activities that can be challenging due to aging or physical limitations.',
            interventions: [
              { id: 'i208', name: 'Reacher/grabber tools', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i209', name: 'Walking canes', urgency: 'Non-Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct34',
            name: 'Assistive Kitchen & Bath',
            description: 'Modifications or devices in kitchens and bathrooms that improve accessibility and ease of use for older adults and individuals with limited mobility.',
            interventions: [
              { id: 'i210', name: 'Accessibility shelving', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i211', name: 'Cabinet adjustments (lower/raise)', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i212', name: 'Anti-scald devices', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i213', name: 'Shower chair/transfer bench', urgency: 'Non-Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct35',
            name: 'Assistive Technology',
            description: 'Technology solutions that enhance safety, independence, and convenience for older adults and individuals aging in place.',
            interventions: [
              { id: 'i214', name: 'Smart door locks', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i215', name: 'Automatic pill dispensers', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i216', name: 'Fall detection devices', urgency: 'Non-Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct36',
            name: 'Comfort Enhancements',
            description: 'Adjustments and tools that improve comfort and simplify daily living tasks, allowing for easier and more enjoyable aging in place.',
            interventions: [
              { id: 'i217', name: 'Ceiling fans', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i218', name: 'Ergonomic furniture', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i219', name: 'Automatic bed risers', urgency: 'Non-Critical', condition: 'Active' }
            ]
          },
          {
            id: 'sct37',
            name: 'Lighting Improvements',
            description: 'Lighting enhancements designed to improve visibility and safety in non-critical situations, particularly for aging individuals.',
            interventions: [
              { id: 'i220', name: 'Motion-activated lights', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i221', name: 'Task lighting', urgency: 'Non-Critical', condition: 'Active' },
              { id: 'i222', name: 'Exterior walkway lighting', urgency: 'Non-Critical', condition: 'Active' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'p3',
    name: 'Home Performance',
    icon: Zap,
    color: C_BRIGHT_BLUE,
    bgColor: 'bg-[#0099CC]/10',
    description: 'Energy efficiency, comfort, and utility cost reduction.',
    subCategories: [
      {
        id: 'sc7',
        name: 'Disaster / Security Readiness',
        description: 'Focuses on active, emergent interventions that prepare homes for disasters or enhance security, ensuring residents safety and resilience during emergencies.',
        types: [
          {
            id: 'sct38',
            name: 'Utility Management',
            description: 'Systems and interventions aimed at ensuring critical utilities remain operational during emergencies or failures. This includes the ability to control, isolate, and protect utility systems from damage or disruption.',
            interventions: [
              { id: 'i223', name: 'Automated shutoff systems', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i224', name: 'Backup generator/power', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i225', name: 'Surge protection', urgency: 'Emergent', condition: 'Passive' }
            ]
          },
          {
            id: 'sct39',
            name: 'Structural Safeguarding',
            description: 'Measures to enhance the physical resilience of a structure against natural or human-induced hazards. These interventions include reinforcement and protection strategies designed to mitigate the effects of forces like earthquakes, floods, and storms.',
            interventions: [
              { id: 'i226', name: 'Hurricane straps/clips', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i227', name: 'Seismic retrofitting', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i228', name: 'Storm shutters', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i229', name: 'Floodproofing/barriers', urgency: 'Emergent', condition: 'Passive' }
            ]
          },
          {
            id: 'sct40',
            name: 'Fire Safety',
            description: 'Systems and devices implemented to detect, control, and prevent the outbreak or spread of fires. These include both preventive measures and active fire suppression systems designed to protect occupants and property.',
            interventions: [
              { id: 'i230', name: 'Smoke/CO2 alarms', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i231', name: 'Fire extinguishers', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i232', name: 'Residential sprinkler system', urgency: 'Emergent', condition: 'Passive' }
            ]
          },
          {
            id: 'sct41',
            name: 'Emergency Preparedness',
            description: 'Precautionary measures and installations designed to prepare a home and its occupants for emergencies. These can include safe rooms, emergency communication systems, and other readiness strategies to protect lives during a crisis.',
            interventions: [
              { id: 'i233', name: 'Safe room construction', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i234', name: 'Home medical alert system', urgency: 'Emergent', condition: 'Passive' },
              { id: 'i235', name: 'Emergency water storage', urgency: 'Emergent', condition: 'Passive' }
            ]
          }
        ]
      },
      {
        id: 'sc8',
        name: 'Home Utilities Performance',
        description: 'Addresses passive, non-critical upgrades and maintenance aimed at improving energy efficiency, water conservation, and overall utility management, optimizing home performance without urgent risks.',
        types: [
          {
            id: 'sct42',
            name: 'Energy - Solar Energy Systems',
            description: 'Installation and maintenance of systems that capture solar energy for home use, helping to reduce reliance on traditional energy sources and lower utility costs.',
            interventions: [
              { id: 'i236', name: 'Solar panel installation', urgency: 'Non-Critical', condition: 'Passive' },
              { id: 'i237', name: 'Solar battery storage', urgency: 'Non-Critical', condition: 'Passive' }
            ]
          },
          {
            id: 'sct43',
            name: 'Energy - Efficient Lighting',
            description: 'Upgrades and modifications to lighting systems that reduce energy consumption while maintaining or improving lighting quality.',
            interventions: [
              { id: 'i238', name: 'LED lighting upgrades', urgency: 'Non-Critical', condition: 'Passive' },
              { id: 'i239', name: 'Smart lighting systems', urgency: 'Non-Critical', condition: 'Passive' }
            ]
          },
          {
            id: 'sct44',
            name: 'Energy - Efficient HVAC/Water Heater',
            description: 'Upgrades or replacements to heating, ventilation, air conditioning, and water heating systems that enhance energy efficiency and optimize performance.',
            interventions: [
              { id: 'i240', name: 'High-efficiency furnace', urgency: 'Non-Critical', condition: 'Passive' },
              { id: 'i241', name: 'Geothermal heat pumps', urgency: 'Non-Critical', condition: 'Passive' },
              { id: 'i242', name: 'Ductless mini-split systems', urgency: 'Non-Critical', condition: 'Passive' }
            ]
          },
          {
            id: 'sct45',
            name: 'Water - Low-flow Fixtures',
            description: 'Installation of water-saving fixtures that reduce water usage while maintaining performance and comfort.',
            interventions: [
              { id: 'i243', name: 'Low-flow showerheads', urgency: 'Non-Critical', condition: 'Passive' },
              { id: 'i244', name: 'Dual-flush toilets', urgency: 'Non-Critical', condition: 'Passive' }
            ]
          },
          {
            id: 'sct46',
            name: 'Weatherization - Insulation',
            description: 'Adding or upgrading insulation in key areas of the home to improve energy efficiency and comfort by reducing heat loss or gain.',
            interventions: [
              { id: 'i245', name: 'Attic insulation', urgency: 'Non-Critical', condition: 'Passive' },
              { id: 'i246', name: 'Spray foam insulation', urgency: 'Non-Critical', condition: 'Passive' },
              { id: 'i247', name: 'Radiant barriers', urgency: 'Non-Critical', condition: 'Passive' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'p4',
    name: 'Community Repair',
    icon: Users,
    color: C_TRAD_GREEN,
    bgColor: 'bg-[#3AA047]/10',
    description: 'Improvements to shared spaces and community assets.',
    subCategories: [
      {
        id: 'sc9',
        name: 'Community / Nonprofit Building Repair',
        description: 'Repairs and improvements to all community and nonprofit buildings that stabilize these buildings so that they may continue to serve the community.',
        types: [
          {
            id: 'sct47',
            name: 'Critical Building Systems Repairs',
            description: 'Repairs focused on essential systems within community and nonprofit buildings that are vital for safe and functional operations. These include interventions that address urgent issues impacting habitability, safety, and compliance with minimum operational standards.',
            interventions: [
              { id: 'i248', name: 'Repair faulty community HVAC', urgency: 'N/A', condition: 'N/A' },
              { id: 'i249', name: 'Fix leaking plumbing systems', urgency: 'N/A', condition: 'N/A' },
              { id: 'i250', name: 'Address critical roof leaks', urgency: 'N/A', condition: 'N/A' }
            ]
          },
          {
            id: 'sct48',
            name: 'Non-Critical Building Improvements',
            description: 'Non-essential improvements that enhance the usability, comfort, or aesthetics of community and nonprofit spaces but are not essential for safety or functionality.',
            interventions: [
              { id: 'i251', name: 'Repaint community rooms', urgency: 'N/A', condition: 'N/A' },
              { id: 'i252', name: 'Replace worn flooring', urgency: 'N/A', condition: 'N/A' }
            ]
          }
        ]
      },
      {
        id: 'sc10',
        name: 'Community Energy & Performance',
        description: 'Repairs and improvements to all community and nonprofit buildings that decrease utility consumption and/or increase climate resilience.',
        types: [
          {
            id: 'sct49',
            name: 'Community Energy Projects',
            description: 'Initiatives focused on improving energy efficiency, reducing energy consumption, and enhancing sustainability within community and nonprofit buildings. These projects aim to lower operational costs and contribute to environmental stewardship.',
            interventions: [
              { id: 'i253', name: 'Install LED lighting upgrades', urgency: 'N/A', condition: 'N/A' },
              { id: 'i254', name: 'Add community solar panels', urgency: 'N/A', condition: 'N/A' },
              { id: 'i255', name: 'Programmable thermostats', urgency: 'N/A', condition: 'N/A' }
            ]
          }
        ]
      },
      {
        id: 'sc11',
        name: 'Public Space Improvements',
        description: 'Non-building repairs and improvements that improve community space conditions.',
        types: [
          {
            id: 'sct50',
            name: 'Community Accessibility Improvements',
            description: 'Modifications and upgrades that improve the accessibility of public spaces and community buildings, ensuring inclusivity for individuals with disabilities and mobility challenges.',
            interventions: [
              { id: 'i256', name: 'Install wheelchair ramps', urgency: 'N/A', condition: 'N/A' },
              { id: 'i257', name: 'Add accessible restrooms', urgency: 'N/A', condition: 'N/A' },
              { id: 'i258', name: 'Improve curb cuts', urgency: 'N/A', condition: 'N/A' }
            ]
          },
          {
            id: 'sct51',
            name: 'Non-critical Community Space Improvements',
            description: 'Enhancements to public and community spaces that improve aesthetics, usability, and overall community well-being but are not essential for safety or accessibility.',
            interventions: [
              { id: 'i259', name: 'Add decorative landscaping', urgency: 'N/A', condition: 'N/A' },
              { id: 'i260', name: 'Install public art/murals', urgency: 'N/A', condition: 'N/A' },
              { id: 'i261', name: 'Upgrade community gardens', urgency: 'N/A', condition: 'N/A' }
            ]
          }
        ]
      }
    ]
  }
];

// --- Helper Functions ---
const flattenInterventions = (): Intervention[] => {
  const all: Intervention[] = [];
  TAXONOMY_DATA.forEach(p => {
    p.subCategories.forEach(sc => {
      sc.types.forEach(t => {
        t.interventions.forEach(i => {
          all.push({ 
            ...i, 
            pillarId: p.id, 
            pillarName: p.name, 
            subCatId: sc.id, 
            subCatName: sc.name, 
            typeId: t.id, 
            typeName: t.name,
            pillarDescription: p.description,
            subCatDescription: sc.description,
            typeDescription: t.description 
          });
        });
      });
    });
  });
  return all;
};

const ALL_INTERVENTIONS = flattenInterventions();

// --- Components ---

const Branding = () => (
  <div className="flex items-center gap-3 px-2 py-1 group">
    <img 
      src={LOGO_URL}
      alt="Catalog Builder" 
      className="h-10 w-auto" 
      loading="eager"
    />
    <div className="flex flex-col">
        <span className="font-extrabold text-xl tracking-tight text-black leading-none">
          Catalog<span className="text-[#E55025]">Builder</span>
        </span>
        <span className="text-[10px] font-bold text-[#88888D] tracking-widest uppercase leading-none mt-1">FOR REPAIRS ACTIVITIES</span>
    </div>
  </div>
);

// Define Interface before usage
interface StatusBadgeProps {
  status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'eligible': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#C4D600]/20 text-[#3AA047]"><CheckCircle className="w-3 h-3 mr-1" /> Eligible</span>;
    case 'not_eligible': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#A4343A]/10 text-[#A4343A]"><XCircle className="w-3 h-3 mr-1" /> Not Eligible</span>;
    case 'conditional': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FFD100]/20 text-[#E55025]"><AlertTriangle className="w-3 h-3 mr-1" /> If/When</span>;
    case 'na': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#88888D]/10 text-[#88888D]"><Ban className="w-3 h-3 mr-1" /> N/A</span>;
    default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Unselected</span>;
  }
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExportConfig;
  onConfigChange: (newConfig: ExportConfig) => void;
  onExport: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, config, onConfigChange, onExport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Export Options</h2>
            <p className="text-sm text-slate-500 mt-1">Customize how your policy manual is generated.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <XCircle size={20} className="text-slate-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Section 1: Format */}
          <div>
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs border border-slate-200">1</span>
               Select Format
             </h3>
             <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => onConfigChange({ ...config, format: 'csv' })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${config.format === 'csv' ? 'border-[#0099CC] bg-[#0099CC]/5 text-[#0099CC]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                >
                  <FileText size={32} className="mb-2" />
                  <span className="font-bold text-sm">CSV Spreadsheet</span>
                </button>
                <button 
                  onClick={() => onConfigChange({ ...config, format: 'pdf' })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${config.format === 'pdf' ? 'border-[#E55025] bg-[#E55025]/5 text-[#E55025]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                >
                  <Printer size={32} className="mb-2" />
                  <span className="font-bold text-sm">Print / PDF</span>
                </button>
                <button 
                   onClick={() => onConfigChange({ ...config, format: 'image' })}
                   className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${config.format === 'image' ? 'border-[#3AA047] bg-[#3AA047]/5 text-[#3AA047]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                >
                  <ImageIcon size={32} className="mb-2" />
                  <span className="font-bold text-sm">Image</span>
                </button>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Section 2: Levels */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs border border-slate-200">2</span>
                Include Levels
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.levels.pillar}
                    onChange={(e) => onConfigChange({ ...config, levels: { ...config.levels, pillar: e.target.checked } })}
                    className="w-5 h-5 text-[#0099CC] rounded focus:ring-[#0099CC]"
                  />
                  <span className="font-medium text-slate-700">Pillars</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.levels.subCategory}
                    onChange={(e) => onConfigChange({ ...config, levels: { ...config.levels, subCategory: e.target.checked } })}
                    className="w-5 h-5 text-[#0099CC] rounded focus:ring-[#0099CC]"
                  />
                  <span className="font-medium text-slate-700">Sub-Categories</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.levels.type}
                    onChange={(e) => onConfigChange({ ...config, levels: { ...config.levels, type: e.target.checked } })}
                    className="w-5 h-5 text-[#0099CC] rounded focus:ring-[#0099CC]"
                  />
                  <span className="font-medium text-slate-700">Types</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.levels.activity}
                    disabled
                    className="w-5 h-5 text-slate-400 rounded bg-slate-100 cursor-not-allowed"
                  />
                  <span className="font-medium text-slate-400">Activities (Always On)</span>
                </label>
              </div>
            </div>

            {/* Section 3: Elements */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs border border-slate-200">3</span>
                Data Elements
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.elements.definitions}
                    onChange={(e) => onConfigChange({ ...config, elements: { ...config.elements, definitions: e.target.checked } })}
                    className="w-5 h-5 text-[#0099CC] rounded focus:ring-[#0099CC]"
                  />
                  <span className="font-medium text-slate-700">Definitions</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.elements.criticality}
                    onChange={(e) => onConfigChange({ ...config, elements: { ...config.elements, criticality: e.target.checked } })}
                    className="w-5 h-5 text-[#0099CC] rounded focus:ring-[#0099CC]"
                  />
                  <span className="font-medium text-slate-700">Criticality (Urgency/Condition)</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.elements.notes}
                    onChange={(e) => onConfigChange({ ...config, elements: { ...config.elements, notes: e.target.checked } })}
                    className="w-5 h-5 text-[#0099CC] rounded focus:ring-[#0099CC]"
                  />
                  <span className="font-medium text-slate-700">User Notes</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onExport}
            className="px-8 py-2.5 rounded-lg font-bold text-white bg-[#0099CC] hover:bg-[#0099CC]/90 shadow-lg shadow-[#0099CC]/20 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

const TopNav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const getButtonClass = (isActive: boolean) => 
    `px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
      isActive 
        ? 'bg-[#E55025]/10 text-[#E55025] border-[#E55025]' 
        : 'bg-transparent text-black border-transparent hover:bg-slate-50'
    }`;

  return (
    <div className="bg-white border-b border-slate-200 h-20 px-6 flex justify-end items-center gap-1">
        <button 
          onClick={() => setView('learn')}
          className={getButtonClass(view === 'learn')}
        >
          <GraduationCap size={18} /> Learn
        </button>
        <button 
          onClick={() => setView('catalog')}
          className={getButtonClass(view === 'catalog')}
        >
          <Hammer size={18} /> Builder
        </button>
        
        {/* Divider */}
        <div className="h-6 w-px bg-[#88888D]/20 mx-2"></div>
        
        <button 
          onClick={() => setView('report')}
          className={getButtonClass(view === 'report')}
        >
          <Download size={18} /> Export
        </button>
    </div>
  );
};

interface LearnSidebarProps {
  currentStep: number;
  steps: { title: string; content: React.ReactNode }[];
  onStepChange: (step: number) => void;
  onHome: () => void;
  view: ViewState;
  setView: (v: ViewState) => void;
}

const LearnSidebar: React.FC<LearnSidebarProps> = ({ currentStep, steps, onStepChange, onHome }) => {
  return (
    <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-full hidden md:flex shrink-0">
      <div className="h-20 flex items-center px-4 border-b border-slate-200">
        <Branding />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
           <div className="flex items-center gap-2 mb-3">
             <BookOpen size={18} className="text-black" />
             <h3 className="font-semibold text-black">Learning Guide</h3>
           </div>
           
            <h4 className="text-xs font-semibold text-[#88888D] uppercase mb-3">Module Progress</h4>
            <div className="space-y-2 relative">
                {/* Visual connecting line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 -z-10"></div>
                
                {steps.map((s, idx) => (
                    <button 
                        key={idx}
                        onClick={() => onStepChange(idx)}
                        className={`flex items-start gap-3 text-left w-full group ${idx === currentStep ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border-2 transition-colors ${
                            idx === currentStep 
                                ? 'bg-[#0099CC] text-white border-[#0099CC]' 
                                : idx < currentStep 
                                    ? 'bg-[#3AA047] text-white border-[#3AA047]'
                                    : 'bg-white text-[#88888D] border-slate-300'
                        }`}>
                            {idx < currentStep ? <CheckCircle size={12} /> : idx + 1}
                        </div>
                        <span className={`text-sm py-0.5 ${idx === currentStep ? 'font-semibold text-black' : 'text-[#88888D]'}`}>
                            {s.title.split(':')[0]}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-[#0099CC]/5 p-4 rounded-lg border border-[#0099CC]/20">
            <h4 className="font-bold text-black text-sm mb-2 flex items-center gap-2">
                <Info size={14}/> Guidance
            </h4>
            <p className="text-xs text-black leading-relaxed">
                Use this module to understand the core taxonomy before building your catalog. 
                <br/><br/>
                <strong>Tip:</strong> Don't rush through the definitions. Understanding the difference between <strong>Critical</strong> and <strong>Emergent</strong> is key to building a defensible policy.
            </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button 
          onClick={() => window.open('https://github.com/jerryzuniga/repairs-catalog/blob/63618948d9784c8b8a88b30769ecb55d4ed99ca5/public/CatalogBuilder-UserGuide.pdf?raw=true', '_blank')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-2 bg-white border border-slate-300 rounded-lg text-black hover:bg-slate-100 transition-colors shadow-sm text-sm"
        >
          <BookOpen size={16} /> Download Guide
        </button>
        <button 
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-black hover:bg-slate-100 transition-colors shadow-sm text-sm"
        >
          <Home size={16} /> Back to Home
        </button>
        <div className="mt-4 text-center text-xs text-[#88888D]">
          Version 1.2.5.3
        </div>
      </div>
    </div>
  );
};

interface ExportSidebarProps {
  onHome: () => void;
}

const ExportSidebar: React.FC<ExportSidebarProps> = ({ onHome }) => {
  return (
    <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-full hidden md:flex shrink-0">
      <div className="h-20 flex items-center px-4 border-b border-slate-200">
        <Branding />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-[#0099CC]/5 p-4 rounded-lg border border-[#0099CC]/20">
            <h4 className="font-bold text-black text-sm mb-2 flex items-center gap-2">
                <Info size={14}/> Export
            </h4>
            <p className="text-xs text-black leading-relaxed">
                Review your final selection of activities. You can copy the text directly or print to PDF to include in your official policy manual.
            </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button 
          onClick={() => window.open('https://github.com/jerryzuniga/repairs-catalog/blob/63618948d9784c8b8a88b30769ecb55d4ed99ca5/public/CatalogBuilder-UserGuide.pdf?raw=true', '_blank')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-2 bg-white border border-slate-300 rounded-lg text-black hover:bg-slate-100 transition-colors shadow-sm text-sm"
        >
          <BookOpen size={16} /> Download Guide
        </button>
        <button 
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-black hover:bg-slate-100 transition-colors shadow-sm text-sm"
        >
          <Home size={16} /> Back to Home
        </button>
        <div className="mt-4 text-center text-xs text-[#88888D]">
          Version 1.2.5.3
        </div>
      </div>
    </div>
  );
};

interface SidebarProps {
  activePillar: string;
  onPillarChange: (id: string) => void;
  activeSubCat: string;
  onSubCatChange: (id: string) => void;
  activeType: string;
  onTypeChange: (id: string) => void;
  selections: SelectionsMap;
  activeStatusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  onHome: () => void;
  showDefinitions: boolean;
  onToggleDefinitions: () => void;
  showCriticalOnly: boolean;
  onToggleCriticalOnly: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activePillar, 
  onPillarChange, 
  activeSubCat, 
  onSubCatChange, 
  activeType, 
  onTypeChange, 
  selections, 
  activeStatusFilter, 
  onStatusFilterChange, 
  onHome, 
  showDefinitions, 
  onToggleDefinitions,
  showCriticalOnly,
  onToggleCriticalOnly
}) => {
  const stats = useMemo(() => {
    let eligible = 0, notEligible = 0, conditional = 0, na = 0;
    Object.values(selections).forEach(s => {
      if (s.status === 'eligible') eligible++;
      if (s.status === 'not_eligible') notEligible++;
      if (s.status === 'conditional') conditional++;
      if (s.status === 'na') na++;
    });
    // Calculate unselected based on total items minus decided items
    const total = ALL_INTERVENTIONS.length;
    const unselected = total - (eligible + notEligible + conditional + na);
    
    // Fix: Key must match statConfig ('not_eligible') not variable name ('notEligible')
    return { eligible, not_eligible: notEligible, conditional, na, unselected };
  }, [selections]);

  const statConfig = useMemo(() => [
    { key: 'eligible', label: 'Eligible', icon: CheckCircle, color: 'text-[#3AA047]', bgActive: 'bg-[#3AA047]/10 ring-[#3AA047]' },
    { key: 'not_eligible', label: 'Not Eligible', icon: XCircle, color: 'text-[#A4343A]', bgActive: 'bg-[#A4343A]/10 ring-[#A4343A]' },
    { key: 'conditional', label: 'If/When', icon: AlertTriangle, color: 'text-[#E55025]', bgActive: 'bg-[#E55025]/10 ring-[#E55025]' },
    { key: 'na', label: 'N/A', icon: Ban, color: 'text-[#88888D]', bgActive: 'bg-[#88888D]/10 ring-[#88888D]' },
    { key: 'unselected', label: 'Unselected', icon: Circle, color: 'text-slate-500', bgActive: 'bg-slate-200 ring-slate-400' },
  ], []);

  const togglePillar = (id: string) => {
    if (activePillar !== id) {
      onPillarChange(id);
      onSubCatChange('all');
      onTypeChange('all');
    } else {
       onPillarChange('all');
       onSubCatChange('all');
       onTypeChange('all');
    }
  };

  const toggleSubCat = (id: string) => {
    if (activeSubCat !== id) {
      onSubCatChange(id);
      onTypeChange('all');
    } else {
      onSubCatChange('all');
      onTypeChange('all');
    }
  };

  return (
    <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-full hidden md:flex shrink-0">
      <div className="h-20 flex items-center px-4 border-b border-slate-200">
        <Branding />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-3 pt-4 pb-2">
            <h3 className="font-semibold text-black flex items-center gap-2 mb-2">
            <Filter size={18} /> Filters
            </h3>
        </div>

        {/* Definitions Toggle */}
        <div className="px-3 mb-2">
             <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200">
                <span className="text-xs font-medium text-slate-700">Show Definitions</span>
                <button
                    onClick={onToggleDefinitions}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${showDefinitions ? 'bg-[#0099CC]' : 'bg-slate-300'}`}
                >
                    <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showDefinitions ? 'translate-x-4' : 'translate-x-1'}`}
                    />
                </button>
            </div>
        </div>

        {/* Critical Only Toggle */}
        <div className="px-3 mb-4">
             <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200">
                <span className="text-xs font-medium text-slate-700">Critical Only</span>
                <button
                    onClick={onToggleCriticalOnly}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${showCriticalOnly ? 'bg-[#A4343A]' : 'bg-slate-300'}`}
                >
                    <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showCriticalOnly ? 'translate-x-4' : 'translate-x-1'}`}
                    />
                </button>
            </div>
        </div>

        <div className="space-y-1">
          <button 
            onClick={() => {
              onPillarChange('all');
              onSubCatChange('all');
              onTypeChange('all');
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm mb-2 ${activePillar === 'all' ? 'bg-black font-bold text-white' : 'hover:bg-slate-100 text-black'}`}
          >
            All Pillars
          </button>
          
          {TAXONOMY_DATA.map(p => {
             const isActivePillar = activePillar === p.id;
             return (
              <div key={p.id} className="space-y-1">
                <button 
                  onClick={() => togglePillar(p.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between group ${isActivePillar ? 'bg-white shadow-sm ring-1 ring-slate-200 font-medium' : 'hover:bg-slate-100 text-black'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.color.replace('text', 'bg')}`}></div>
                    <span className="truncate">{p.name}</span>
                  </div>
                  {isActivePillar ? <ChevronDown size={14} className="text-[#88888D]"/> : <ChevronRight size={14} className="text-[#88888D] group-hover:text-black"/>}
                </button>

                {isActivePillar && (
                  <div className="ml-3 pl-3 border-l border-slate-200 space-y-1 my-1">
                    {p.subCategories.map(sc => {
                      const isActiveSub = activeSubCat === sc.id;
                      const activityCount = sc.types.reduce((acc, t) => acc + t.interventions.length, 0);
                      return (
                        <div key={sc.id}>
                          <button
                            onClick={() => toggleSubCat(sc.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${isActiveSub ? 'bg-slate-100 text-black font-medium' : 'text-[#88888D] hover:text-black hover:bg-slate-50'}`}
                          >
                             <span className="truncate">{sc.name} <span className="text-[#88888D] text-[10px]">({activityCount})</span></span>
                             {isActiveSub ? <ChevronDown size={12}/> : <ChevronRight size={12} className="opacity-0 group-hover:opacity-100"/>}
                          </button>
                          
                          {isActiveSub && (
                            <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 my-1">
                              {sc.types.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => onTypeChange(t.id === activeType ? 'all' : t.id)}
                                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] leading-tight ${activeType === t.id ? 'bg-[#0099CC]/10 text-[#0099CC] font-semibold shadow-sm' : 'text-[#88888D] hover:text-black truncate'}`}
                                >
                                  {t.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
             );
          })}
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-[#88888D] uppercase">Your Policy Stats</h4>
        </div>
        <div className="space-y-1 text-sm">
          {statConfig.map((item) => {
             const isActive = activeStatusFilter === item.key;
             return (
             <button 
                key={item.key} 
                onClick={() => onStatusFilterChange(isActive ? null : item.key)}
                className={`w-full flex justify-between items-center px-2 py-1.5 rounded transition-all ${
                    isActive 
                    ? `${item.bgActive} ring-1 font-semibold` 
                    : 'hover:bg-slate-100'
                }`}
             >
                <span className={`flex items-center gap-2 ${item.color} ${isActive ? 'font-bold' : ''}`}>
                    <item.icon size={14}/> {item.label}
                </span>
                <span className={`font-mono font-bold ${isActive ? 'text-black' : (item.key === 'unselected' ? 'text-slate-500' : 'text-black')}`}>
                    {stats[item.key as keyof typeof stats]}
                </span>
             </button>
             );
          })}
        </div>
        <button 
          onClick={() => window.open('https://github.com/jerryzuniga/repairs-catalog/blob/63618948d9784c8b8a88b30769ecb55d4ed99ca5/public/CatalogBuilder-UserGuide.pdf?raw=true', '_blank')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-4 mb-2 bg-white border border-slate-300 rounded-lg text-black hover:bg-slate-100 transition-colors shadow-sm text-sm"
        >
          <BookOpen size={16} /> Download Guide
        </button>
        <button 
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-black hover:bg-slate-100 transition-colors shadow-sm text-sm"
        >
          <Home size={16} /> Back to Home
        </button>
        <div className="mt-4 text-center text-xs text-[#88888D]">
          Version 1.2.5.3
        </div>
      </div>
    </div>
  );
};

const MatrixGrid = () => {
  const cells = [
    { u: 'Critical', c: 'Active', color: 'bg-[#A4343A] text-white', label: 'Priority 1: Immediate Action' },
    { u: 'Emergent', c: 'Active', color: 'bg-[#E55025] text-white', label: 'Priority 2: High Urgency' },
    { u: 'Non-Critical', c: 'Active', color: 'bg-[#FFD100] text-black', label: 'Priority 4: Monitor' },
    { u: 'Critical', c: 'Passive', color: 'bg-[#E55025] text-white', label: 'Priority 2: Address Soon' },
    { u: 'Emergent', c: 'Passive', color: 'bg-[#FFD100] text-black', label: 'Priority 3: Plan' },
    { u: 'Non-Critical', c: 'Passive', color: 'bg-[#88888D]/50 text-white', label: 'Priority 4: Defer' },
    { u: 'Critical', c: 'Inactive', color: 'bg-[#FFD100] text-black', label: 'Priority 3: Investigate' },
    { u: 'Emergent', c: 'Inactive', color: 'bg-[#88888D]/50 text-white', label: 'Priority 4: Defer' },
    { u: 'Non-Critical', c: 'Inactive', color: 'bg-[#88888D]/20 text-black', label: 'Priority 5: No Action' },
  ];

  return (
    <div className="grid grid-cols-[100px_1fr_1fr_1fr] gap-3 text-xs sm:text-sm">
      {/* Header Row */}
      <div className="col-start-2 text-center font-bold text-black">Active Condition</div>
      <div className="text-center font-bold text-black">Passive Condition</div>
      <div className="text-center font-bold text-black">Inactive Condition</div>

      {/* Rows */}
      <div className="flex items-center justify-end pr-4 font-bold text-black">Critical</div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[0].color}`}>
        <span className="font-bold">Critical / Active</span>
        <span className="opacity-90">{cells[0].label}</span>
      </div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[3].color}`}>
        <span className="font-bold">Critical / Passive</span>
        <span className="opacity-90">{cells[3].label}</span>
      </div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[6].color}`}>
        <span className="font-bold">Critical / Inactive</span>
        <span className="opacity-90">{cells[6].label}</span>
      </div>

      <div className="flex items-center justify-end pr-4 font-bold text-black">Emergent</div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[1].color}`}>
        <span className="font-bold">Emergent / Active</span>
        <span className="opacity-90">{cells[1].label}</span>
      </div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[4].color}`}>
        <span className="font-bold">Emergent / Passive</span>
        <span className="opacity-90">{cells[4].label}</span>
      </div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[7].color}`}>
        <span className="font-bold">Emergent / Inactive</span>
        <span className="opacity-90">{cells[7].label}</span>
      </div>

      <div className="flex items-center justify-end pr-4 font-bold text-black">Non-Critical</div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[2].color}`}>
        <span className="font-bold">Non-Critical / Active</span>
        <span className="opacity-90">{cells[2].label}</span>
      </div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[5].color}`}>
        <span className="font-bold">Non-Critical / Passive</span>
        <span className="opacity-90">{cells[5].label}</span>
      </div>
      <div className={`h-24 md:h-32 rounded-lg p-3 flex flex-col justify-between shadow-sm transition-transform hover:scale-105 ${cells[8].color}`}>
        <span className="font-bold">Non-Critical / Inactive</span>
        <span className="opacity-90">{cells[8].label}</span>
      </div>
    </div>
  );
};

// --- Views ---

interface LandingViewProps {
  onStart: () => void;
  onLearn: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onStart, onLearn }) => (
  <div className="h-full overflow-y-auto bg-white">
    <nav className="bg-white border-b border-[#88888D]/20 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src={LOGO_URL}
                alt="Catalog Builder" 
                className="h-10 w-auto" 
                loading="eager"
              />
              <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-black leading-none">
                    Catalog<span className="text-[#E55025]">Builder</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#88888D] tracking-widest uppercase leading-none mt-1">FOR REPAIRS ACTIVITIES</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={onLearn}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 bg-slate-100 text-black hover:bg-slate-50"
              >
                <GraduationCap size={18} /> Learn
              </button>
              <button 
                onClick={onStart}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 bg-black text-white hover:bg-gray-800 shadow-sm"
              >
                <Hammer size={18} /> Launch Builder
              </button>
            </div>
          </div>
        </div>
      </nav>

    {/* Hero Section */}
    <div className="bg-[#E55025] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-orange-600 to-[#E55025]"></div>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-white"></span>
            Version 1.2.5.3 Available
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Standardize Your <span className="text-white">Home Repair</span> Program Offerings
          </h1>
          <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            The Builder uses one shared catalog to standardize activities, prioritize and sequence repairs, generate consistent eligible-activities policy, and strengthen network-wide learning and research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#E55025] rounded-lg font-bold text-lg hover:bg-slate-50 transition-all shadow-lg shadow-black/10"
            >
              Start Activity Builder <ArrowRight size={20} />
            </button>
            <button
              onClick={onLearn}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white border border-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Learn the Framework
            </button>
          </div>
        </div>
      </div>
      
      {/* Abstract visual shapes */}
      <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 100 100" className="h-full w-full fill-current text-white">
          <path d="M50 0 L100 0 L100 100 L0 100 Z" />
        </svg>
      </div>
    </div>

    {/* Value Props */}
    <div className="pt-12 pb-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Logo Moved Here */}
        <div className="mb-12 flex justify-center">
           <div className="">
              <img 
                src="https://github.com/jerryzuniga/repairs-catalog/blob/fd2b835413161d9a35a156dbe830f8ecc911531f/public/catalog.png?raw=true" 
                alt="Catalog Builder Logo" 
                className="w-24 h-24"
              />
           </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-black">Why use the Catalog Builder?</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#0099CC]/10 text-[#0099CC] rounded-xl flex items-center justify-center mb-6">
              <Layers size={24} />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">Unified Taxonomy</h3>
            <p className="text-sm text-[#88888D] leading-relaxed">
              Build your catalog once, then use it everywhere. A shared structure keeps your activity list consistent across tools, teams, and reporting, so data rolls up cleanly across the network.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#E55025]/10 text-[#E55025] rounded-xl flex items-center justify-center mb-6">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">Smart Prioritization</h3>
            <p className="text-sm text-[#88888D] leading-relaxed">
              Use a simple prioritization method (based on urgency and condition) to rank and sequence repairs consistently, while staying flexible for local housing stock, climate, and capacity.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#3AA047]/10 text-[#3AA047] rounded-xl flex items-center justify-center mb-6">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">Standardized Policy</h3>
            <p className="text-sm text-[#88888D] leading-relaxed">
              Generate a standardized eligible activities document in minutes, iterate as your scope evolves, and re-export anytime without rewriting or drifting out of sync.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#A4343A]/10 text-[#A4343A] rounded-xl flex items-center justify-center mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">Stronger Network</h3>
            <p className="text-sm text-[#88888D] leading-relaxed">
              Together, we can aggregate data across affiliates, spot trends, and strengthen research that improves guidance and investment across the network.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Call to Action Footer */}
    <div className="bg-slate-900 text-white py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Before you begin...</h2>
        <p className="text-[#88888D] text-lg mb-8">
          Review the guided learning modules to familiarize yourself with the Catalog Builder.
        </p>
        <button
          onClick={onLearn}
          className="px-8 py-4 bg-[#3AA047] text-white rounded-lg font-bold text-lg hover:bg-[#3AA047]/90 transition-all shadow-lg shadow-[#3AA047]/20"
        >
          Open Learning Guide
        </button>
      </div>
    </div>
  </div>
);

interface LearnViewProps {
  onComplete: () => void;
  selections: SelectionsMap;
  onHome: () => void;
  view: ViewState;
  setView: (v: ViewState) => void;
}

const LearnView: React.FC<LearnViewProps> = ({ onComplete, onHome, view, setView }) => {
  const [step, setStep] = useState(0);
  
  // Separate residential and community pillars for display
  const residentialPillars = TAXONOMY_DATA.filter(p => p.id !== 'p4');
  const communityPillars = TAXONOMY_DATA.filter(p => p.id === 'p4');

  const steps = [
    {
      title: "The Four Pillars",
      content: (
        <div className="space-y-6">
          <p className="text-[#88888D]">All repair work falls into one of these four high-level goals. This is the highest level of reporting.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TAXONOMY_DATA.map(p => {
               const Icon = p.icon;
               return (
                 <div key={p.id} className={`${p.bgColor} p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow`}>
                   <div className="flex items-center gap-3 mb-3">
                     <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                       <Icon size={24} className={p.color} />
                     </div>
                     <h3 className="font-bold text-black text-lg">{p.name}</h3>
                   </div>
                   <p className="text-black leading-relaxed">{p.description}</p>
                 </div>
               )
            })}
          </div>
        </div>
      )
    },
    {
      title: "Taxonomy",
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-[#0099CC]/5 rounded-lg border border-[#0099CC]/20">
            <Info className="text-[#0099CC] min-w-[24px]" />
            <div>
              <h3 className="font-bold text-black mb-2">The Problem</h3>
              <p className="text-black">Affiliates use inconsistent language. "Roof repair" might mean a full replacement in one county and a patch in another. This makes it impossible to compare data or define standard policies.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-black mb-4">The <strong>Housing Preservation Framework</strong> breaks down complex repair work into a standard hierarchy. This allows us to:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#3AA047]"/> <span>Standardize reporting across affiliates</span></li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#3AA047]"/> <span>Define precise eligibility rules</span></li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#3AA047]"/> <span>Prioritize based on real need (Criticality)</span></li>
              </ul>
            </div>
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
               <h4 className="font-bold text-black mb-4 text-center text-sm uppercase tracking-wide">The Hierarchy</h4>
               <div className="space-y-2 max-w-[200px] mx-auto">
                 <div className="p-2 bg-black text-white text-center rounded text-sm font-semibold">Pillar</div>
                 <div className="flex justify-center"><ChevronDown size={16} className="text-[#88888D]"/></div>
                 <div className="p-2 bg-[#88888D] text-white text-center rounded text-sm font-semibold">Sub-Category</div>
                 <div className="flex justify-center"><ChevronDown size={16} className="text-[#88888D]"/></div>
                 <div className="p-2 bg-[#88888D] text-white text-center rounded text-sm font-semibold">Type</div>
                 <div className="flex justify-center"><ChevronDown size={16} className="text-[#88888D]"/></div>
                 <div className="p-2 bg-[#3AA047] text-white text-center rounded text-sm font-bold shadow-lg transform scale-105">Activity</div>
               </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Deep Dive: Sub-Category Definitions",
      content: (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div>
            <h3 className="text-xl font-bold text-black mb-4 border-b border-slate-200 pb-2">A. Residential Unit Sub-Categories</h3>
            <p className="text-sm text-[#88888D] mb-6">Each sub-category is assigned a default Urgency and Condition State to help prioritization.</p>
            
            {residentialPillars.map(pillar => (
              <div key={pillar.id} className="mb-8">
                <h4 className={`font-bold ${pillar.color} mb-3 flex items-center gap-2`}>
                  <pillar.icon size={20}/> {pillar.name}
                </h4>
                <div className="grid gap-4">
                  {pillar.subCategories.map(sc => {
                    // Determine default tags based on pillar or subcategory name/content if needed, 
                    // or hardcode specific logic for display if it varies significantly from data.
                    // For now, we will infer a representative tag from the first item if available, or static values.
                    // In a real app, these 'default' properties might be on the SC object itself.
                    // Here we maintain the visual style requested.
                    
                    let urgencyTag = "Critical";
                    let conditionTag = "Active";
                    let borderColor = "border-[#A4343A]";
                    let urgencyColor = "bg-[#A4343A]/10 text-[#A4343A]";

                    // Simple logic to match the requested visual style based on Pillar/SC
                    if (pillar.name === 'Occupant Health' && sc.name.includes('Non-Critical')) {
                        urgencyTag = "Non-Critical";
                        borderColor = "border-[#FFD100]";
                        urgencyColor = "bg-[#FFD100]/20 text-[#E55025]";
                    } else if (pillar.name === 'Dwelling Safety' && sc.name.includes('HSM')) {
                        urgencyTag = "Emergent";
                        borderColor = "border-[#E55025]";
                        urgencyColor = "bg-[#E55025]/10 text-[#E55025]";
                    } else if (pillar.name === 'Home Performance') {
                        if (sc.name.includes('Utilities')) {
                             urgencyTag = "Non-Critical";
                             conditionTag = "Passive";
                             borderColor = "border-[#FFD100]";
                             urgencyColor = "bg-[#FFD100]/20 text-[#E55025]";
                        } else {
                             urgencyTag = "Emergent";
                             conditionTag = "Passive";
                             borderColor = "border-[#E55025]";
                             urgencyColor = "bg-[#E55025]/10 text-[#E55025]";
                        }
                    }

                    return (
                      <div key={sc.id} className={`bg-white p-5 rounded-lg border-l-4 ${borderColor} shadow-sm`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-black text-lg">{sc.name}</span>
                          <div className="flex gap-2 shrink-0 ml-2">
                              <span className={`px-2 py-0.5 ${urgencyColor} text-xs rounded font-bold uppercase tracking-wide`}>{urgencyTag}</span>
                              <span className="px-2 py-0.5 bg-slate-200 text-black text-xs rounded font-bold uppercase tracking-wide">{conditionTag}</span>
                          </div>
                        </div>
                        <p className="text-sm text-[#88888D] leading-relaxed">{sc.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xl font-bold text-black mb-4 border-b border-slate-200 pb-2">B. Community-based Sub-Categories</h3>
            <p className="text-sm text-[#88888D] mb-6 bg-slate-100 p-3 rounded-lg border border-slate-200 inline-flex items-center gap-2">
              <Info size={16} className="text-[#88888D]"/> 
              <span><strong>Note:</strong> Criticality currently does not apply for Community Repair sub-categories.</span>
            </p>
            
            {communityPillars.map(pillar => (
              <div key={pillar.id} className="mb-6">
                 <h4 className={`font-bold ${pillar.color} mb-3 flex items-center gap-2`}>
                   <pillar.icon size={20}/> {pillar.name}
                 </h4>
                 <div className="grid gap-4">
                   {pillar.subCategories.map(sc => (
                     <div key={sc.id} className={`bg-white p-5 rounded-lg border-l-4 ${pillar.color.replace('text', 'border')} shadow-sm`}>
                       <span className="font-bold text-black block mb-2 text-lg">{sc.name}</span>
                       <p className="text-sm text-[#88888D] leading-relaxed">{sc.description}</p>
                     </div>
                   ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Understanding Criticality",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-[#88888D]">We don't just ask "what needs fixing?", we ask "how urgent is it?". Criticality is determined by two factors:</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#E55025]/5 p-6 rounded-xl border border-[#E55025]/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-[#E55025]" />
                <h3 className="text-xl font-bold text-[#E55025]">1. Urgency</h3>
              </div>
              <ul className="space-y-4">
                <li className="bg-white p-3 rounded shadow-sm border border-[#E55025]/20">
                  <span className="font-bold text-[#A4343A] block mb-1">Critical</span>
                  <span className="text-sm text-[#88888D]">Immediate threat to life, health, or safety. Must be addressed now.</span>
                </li>
                <li className="bg-white p-3 rounded shadow-sm border border-[#E55025]/20">
                  <span className="font-bold text-[#E55025] block mb-1">Emergent</span>
                  <span className="text-sm text-[#88888D]">Will become critical within 6-12 months if ignored.</span>
                </li>
                <li className="bg-white p-3 rounded shadow-sm border border-[#E55025]/20">
                  <span className="font-bold text-[#FFD100] block mb-1">Non-Critical</span>
                  <span className="text-sm text-[#88888D]">Maintenance, efficiency, or cosmetic issues. No immediate threat.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-black" />
                <h3 className="text-xl font-bold text-black">2. Condition State</h3>
              </div>
              <ul className="space-y-4">
                <li className="bg-white p-3 rounded shadow-sm border border-slate-200">
                  <span className="font-bold text-black block mb-1">Active</span>
                  <span className="text-sm text-[#88888D]">The defect is currently causing damage (e.g., active roof leak, live wires).</span>
                </li>
                <li className="bg-white p-3 rounded shadow-sm border border-slate-200">
                  <span className="font-bold text-[#88888D] block mb-1">Passive</span>
                  <span className="text-sm text-[#88888D]">Broken but stable. Not getting worse actively (e.g., broken window pane).</span>
                </li>
                <li className="bg-white p-3 rounded shadow-sm border border-slate-200">
                  <span className="font-bold text-[#88888D]/50 block mb-1">Inactive</span>
                  <span className="text-sm text-[#88888D]">Functioning but old, inefficient, or nearing end of life.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Criticality Matrix",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <h3 className="font-bold text-black mb-2 flex items-center gap-2">
              <MousePointerClick size={20} /> How to use this Matrix
            </h3>
            <p className="text-[#88888D]">
              When assessing a home, map every defect to this grid. <strong>Red zones</strong> represent your highest priority (Scope A). 
              <strong>Orange/Yellow zones</strong> are secondary (Scope B). <strong>Grey zones</strong> should typically be referred out or deferred.
            </p>
          </div>
          
          {/* Embedding the Matrix Grid here */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <MatrixGrid />
          </div>
        </div>
      )
    },
    {
      title: "Activity-level Policy",
      content: (
        <div className="space-y-6">
          <div className="bg-[#0099CC]/5 p-4 rounded-lg border border-[#0099CC]/20 flex items-start gap-3">
             <LayoutGrid className="text-[#0099CC] mt-1" size={24} />
             <div>
               <h3 className="font-bold text-black mb-2">Your Workspace</h3>
               <p className="text-black text-sm">The Catalog view is your interactive workspace. Here you will make policy decisions for every activity in the framework.</p>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
               <h4 className="font-bold text-black mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-slate-200 text-black flex items-center justify-center text-xs">1</span>
                 Navigation & Filters
               </h4>
               <p className="text-[#88888D] text-sm mb-4">
                 Use the left sidebar to drill down into Pillars, Sub-Categories, and Types. You can also use the search bar at the top to find specific keywords like "Roof" or "Mold".
               </p>
               
               <h4 className="font-bold text-black mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-slate-200 text-black flex items-center justify-center text-xs">2</span>
                 Set Criticality Defaults
               </h4>
               <p className="text-[#88888D] text-sm mb-4">
                 Each activity comes with a default Urgency and Condition. You can override these per activity if your local context differs.
               </p>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
               <h4 className="font-bold text-black mb-4 text-center">The Decision Buttons</h4>
               <div className="space-y-3">
                 <div className="bg-white p-3 rounded shadow-sm border-l-4 border-[#3AA047]">
                   <span className="font-bold text-[#3AA047] block text-xs uppercase">Eligible</span>
                   <span className="text-xs text-[#88888D]">Standard offer. We do this work.</span>
                 </div>
                 <div className="bg-white p-3 rounded shadow-sm border-l-4 border-[#A4343A]">
                   <span className="font-bold text-[#A4343A] block text-xs uppercase">Not Eligible</span>
                   <span className="text-xs text-[#88888D]">We do not fund or perform this work.</span>
                 </div>
                 <div className="bg-white p-3 rounded shadow-sm border-l-4 border-[#FFD100]">
                   <span className="font-bold text-[#E55025] block text-xs uppercase">If/When</span>
                   <span className="text-xs text-[#88888D]">Only under specific circumstances (add a note!).</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Build Your Policy?",
      content: (
        <div className="text-center space-y-8 py-8">
          <div className="w-20 h-20 bg-[#3AA047]/10 text-[#3AA047] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black mb-4">You're ready to start.</h3>
            <p className="text-lg text-[#88888D] max-w-xl mx-auto">
              Use the <strong>Catalog</strong> to browse activities. Mark them as Eligible, Not Eligible, or Conditional. 
              Then, use the <strong>Export Activities</strong> tool to generate your manual.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <LearnSidebar 
        currentStep={step}
        steps={steps}
        onStepChange={setStep}
        onHome={onHome}
        view={view}
        setView={setView}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav view={view} setView={setView} />
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto flex flex-col h-full">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-black">{steps[step].title}</h2>
                <span className="text-sm font-medium px-3 py-1 bg-slate-200 rounded-full text-black">Step {step + 1} of {steps.length}</span>
                </div>
                
                <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
                <div 
                    className="bg-[#0099CC] h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {steps[step].content}
                </div>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50/90 backdrop-blur pb-4">
                <button 
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="px-6 py-3 rounded-lg text-[#88888D] font-medium disabled:opacity-30 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                >
                Back
                </button>
                <button 
                onClick={() => {
                    if (step === steps.length - 1) onComplete();
                    else setStep(step + 1);
                }}
                className="px-8 py-3 bg-[#0099CC] text-white font-bold rounded-lg hover:bg-[#0099CC]/80 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                {step === steps.length - 1 ? "Start Activity Builder" : "Next Step"}
                {step !== steps.length - 1 && <ChevronRight size={18} />}
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

interface BreadcrumbsProps {
  activePillar: string;
  activeSubCat: string;
  activeType: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activePillar, activeSubCat, activeType }) => {
  const pillar = TAXONOMY_DATA.find(p => p.id === activePillar);
  const subCat = pillar?.subCategories.find(sc => sc.id === activeSubCat);
  const type = subCat?.types.find(t => t.id === activeType);

  if (activePillar === 'all' || !pillar) return <div className="text-sm text-[#88888D] font-medium">Viewing All Catalog</div>;

  return (
    <div className="flex items-center gap-2 text-sm text-[#88888D] mt-2">
      <span className="font-semibold text-black">{pillar.name}</span>
      {subCat && (
        <>
          <ChevronRight size={14} className="text-[#88888D]" />
          <span className={!type ? "font-semibold text-black" : ""}>{subCat.name}</span>
        </>
      )}
      {type && (
        <>
          <ChevronRight size={14} className="text-[#88888D]" />
          <span className="font-semibold text-[#0099CC] bg-[#0099CC]/10 px-2 py-0.5 rounded border border-[#0099CC]/20">{type.name}</span>
        </>
      )}
    </div>
  );
};

interface CatalogViewProps {
  selections: SelectionsMap;
  onUpdateSelection: (id: string, data: Selection) => void;
  onHome: () => void;
  view: ViewState;
  setView: (v: ViewState) => void;
}

const CatalogView: React.FC<CatalogViewProps> = ({ selections, onUpdateSelection, onHome, view, setView }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activePillar, setActivePillar] = useState("all");
  const [activeSubCat, setActiveSubCat] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const filteredData = useMemo(() => {
    let data = TAXONOMY_DATA;
    
    // Filter by Pillar
    if (activePillar !== "all") {
      data = data.filter(p => p.id === activePillar);
    }
    
    // Process subcats and types based on filters and search
    return data.map(p => ({
      ...p,
      subCategories: p.subCategories.map(sc => ({
        ...sc,
        types: sc.types.map(t => ({
          ...t,
          interventions: t.interventions.filter(i => {
            // Search text filter
            const textMatch = (!searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // Status filter
            let statusMatch = true;
            if (activeStatusFilter) {
              const status = selections[i.id]?.status;
              if (activeStatusFilter === 'unselected') {
                statusMatch = !status;
              } else {
                statusMatch = status === activeStatusFilter;
              }
            }

            // Critical Only filter
            let criticalMatch = true;
            if (showCriticalOnly) {
              const currentUrgency = selections[i.id]?.urgency || i.urgency;
              criticalMatch = currentUrgency === 'Critical';
            }
            
            return textMatch && statusMatch && criticalMatch;
          })
        })).filter(t => {
           // Type filter logic
           const typeMatch = activeType === 'all' || t.id === activeType;
           const hasInterventions = t.interventions.length > 0;
           return typeMatch && hasInterventions;
        })
      })).filter(sc => {
          // SubCat filter logic
          const subCatMatch = activeSubCat === 'all' || sc.id === activeSubCat;
          const hasTypes = sc.types.length > 0;
          return subCatMatch && hasTypes;
      })
    })).filter(p => p.subCategories.length > 0);
  }, [searchTerm, activePillar, activeSubCat, activeType, activeStatusFilter, selections, showCriticalOnly]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        activePillar={activePillar} 
        onPillarChange={setActivePillar}
        activeSubCat={activeSubCat}
        onSubCatChange={setActiveSubCat}
        activeType={activeType}
        onTypeChange={setActiveType}
        selections={selections}
        activeStatusFilter={activeStatusFilter}
        onStatusFilterChange={setActiveStatusFilter}
        onHome={onHome}
        showDefinitions={showDefinitions}
        onToggleDefinitions={() => setShowDefinitions(!showDefinitions)}
        showCriticalOnly={showCriticalOnly}
        onToggleCriticalOnly={() => setShowCriticalOnly(!showCriticalOnly)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav view={view} setView={setView} />
        <div className="flex-1 overflow-y-auto bg-white">
            <div className="sticky top-0 bg-white border-b border-slate-200 z-10 px-6 py-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88888D]" size={20} />
                <input 
                type="text" 
                placeholder="Search activities (e.g., 'mold', 'foundation', 'roof')..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Breadcrumbs activePillar={activePillar} activeSubCat={activeSubCat} activeType={activeType} />
              {activeStatusFilter && (
                <button 
                  onClick={() => setActiveStatusFilter(null)}
                  className="text-xs font-medium text-[#E55025] hover:text-[#A4343A] flex items-center gap-1"
                >
                  <XCircle size={12} /> Clear "{activeStatusFilter === 'unselected' ? 'Unselected' : activeStatusFilter}" filter
                </button>
              )}
            </div>
            </div>

            <div className="p-6 space-y-12">
            {filteredData.length === 0 ? (
                <div className="text-center text-[#88888D] py-12">No activities found matching your filters.</div>
            ) : (
                filteredData.map(pillar => {
                    // Original Data Lookup for Totals
                    const originalPillar = TAXONOMY_DATA.find(p => p.id === pillar.id);
                    const totalPillarSubCatCount = originalPillar?.subCategories.length || 0;
                    const totalPillarActivityCount = originalPillar?.subCategories.reduce((acc, sc) => acc + sc.types.reduce((tAcc, t) => tAcc + t.interventions.length, 0), 0) || 0;

                    // Filtered Counts
                    const pillarSubCatCount = pillar.subCategories.length;
                    const pillarActivityCount = pillar.subCategories.reduce((acc, sc) => acc + sc.types.reduce((tAcc, t) => tAcc + t.interventions.length, 0), 0);

                    return (
                    <div key={pillar.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                        {/* Tier 1: Pillar Header */}
                        <div className={`${pillar.bgColor} px-8 py-6 border-b border-slate-200 flex items-center justify-between`}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-black/5">
                                    <pillar.icon className={pillar.color} size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-black tracking-tight">{pillar.name}</h2>
                                    {showDefinitions && <p className="text-sm text-black/80 mt-1 max-w-2xl leading-relaxed">{pillar.description}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/50 border border-black/10 rounded-full text-black/70 text-center min-w-[120px]">
                                        {pillarSubCatCount} of {totalPillarSubCatCount} Sub-Categories
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/50 border border-black/10 rounded-full text-black/70 text-center min-w-[100px]">
                                        {pillarActivityCount} of {totalPillarActivityCount} Activities
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-200">
                        {pillar.subCategories.map(sc => {
                            // Original Data Lookup for Totals
                            const originalSubCat = TAXONOMY_DATA.find(p => p.id === pillar.id)?.subCategories.find(s => s.id === sc.id);
                            const totalScTypeCount = originalSubCat?.types.length || 0;
                            const totalScActivityCount = originalSubCat?.types.reduce((acc, t) => acc + t.interventions.length, 0) || 0;

                            // Filtered Counts
                            const scTypeCount = sc.types.length;
                            const scActivityCount = sc.types.reduce((acc, t) => acc + t.interventions.length, 0);

                            return (
                            <div key={sc.id} className="group">
                                {/* Tier 2: Sub-Category Header */}
                                <div className={`px-8 py-5 bg-slate-50/80 border-l-[6px] ${pillar.color.replace('text', 'border')}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest opacity-60 ${pillar.color}`}>Sub-Category</span>
                                            <span className="font-bold text-lg text-slate-900">{sc.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 rounded-full text-slate-600 text-center min-w-[60px]">
                                                {scTypeCount} of {totalScTypeCount} Types
                                            </span>
                                            <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 rounded-full text-slate-600 text-center min-w-[70px]">
                                                {scActivityCount} of {totalScActivityCount} Activities
                                            </span>
                                        </div>
                                    </div>
                                    {showDefinitions && sc.description && (
                                        <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl border-l-2 border-slate-200 pl-3">{sc.description}</p>
                                    )}
                                </div>
                                
                                <div className="p-8 bg-white">
                                    <div className="grid gap-10">
                                        {sc.types.map(type => {
                                            // Original Data Lookup for Totals
                                            const originalType = TAXONOMY_DATA.find(p => p.id === pillar.id)?.subCategories.find(s => s.id === sc.id)?.types.find(t => t.id === type.id);
                                            const totalTypeActivityCount = originalType?.interventions.length || 0;

                                            // Filtered Count
                                            const typeActivityCount = type.interventions.length;

                                            return (
                                            <div key={type.id} className="relative">
                                                {/* Tier 3: Type Header */}
                                                <div className="flex items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-3">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 shadow-sm ${pillar.color.replace('text', 'bg')}`}></div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                                {type.name}
                                                            </h4>
                                                            {showDefinitions && type.description && (
                                                                <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-lg">{type.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 font-medium border border-slate-200 whitespace-nowrap text-center min-w-[70px]">
                                                        {typeActivityCount} of {totalTypeActivityCount} Activities
                                                    </span>
                                                </div>
                                                
                                                {/* Tier 4: Activities Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-7">
                                                    {type.interventions.map(int => {
                                                        const sel = selections[int.id] || {};
                                                        return (
                                                        <div key={int.id} className={`border-l-4 ${pillar.color.replace('text', 'border')} border-y border-r rounded-r-lg p-4 transition-all flex flex-col justify-between h-full group/card ${sel.status ? 'border-slate-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/30 hover:bg-white hover:shadow-md'}`}>
                                                            <div className="flex flex-col gap-2 mb-3">
                                                                <div className="flex justify-between items-start">
                                                                    <h5 className={`font-medium ${pillar.color} text-sm leading-tight pr-2`}>{int.name}</h5>
                                                                    <StatusBadge status={sel.status} />
                                                                </div>
                                                                
                                                                <div className="flex gap-2 mt-2">
                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                        <label className="text-[10px] text-[#88888D] font-semibold mb-0.5 truncate">URGENCY</label>
                                                                        <select
                                                                        value={sel.urgency || int.urgency}
                                                                        onChange={(e) => onUpdateSelection(int.id, { ...sel, urgency: e.target.value })}
                                                                        className="w-full text-[10px] uppercase tracking-wider px-2 py-1 bg-slate-100 text-black rounded border border-slate-200 cursor-pointer hover:bg-slate-200 focus:ring-1 focus:ring-[#0099CC] focus:outline-none"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                        {['Critical', 'Emergent', 'Non-Critical', 'N/A'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                        <label className="text-[10px] text-[#88888D] font-semibold mb-0.5 truncate">CONDITION</label>
                                                                        <select
                                                                        value={sel.condition || int.condition}
                                                                        onChange={(e) => onUpdateSelection(int.id, { ...sel, condition: e.target.value })}
                                                                        className="w-full text-[10px] uppercase tracking-wider px-2 py-1 bg-slate-100 text-black rounded border border-slate-200 cursor-pointer hover:bg-slate-200 focus:ring-1 focus:ring-[#0099CC] focus:outline-none"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                        {['Active', 'Passive', 'Inactive', 'N/A'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Action Buttons */}
                                                            <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                                                                <button 
                                                                    onClick={() => onUpdateSelection(int.id, { ...sel, status: sel.status === 'eligible' ? undefined : 'eligible' })}
                                                                    className={`flex-1 text-xs py-1.5 rounded border transition-colors ${sel.status === 'eligible' ? 'bg-[#3AA047] text-white border-[#3AA047] font-bold' : 'border-slate-200 text-[#88888D] hover:bg-[#3AA047]/10 hover:text-[#3AA047] hover:border-[#3AA047]/30'}`}
                                                                >
                                                                    Eligible
                                                                </button>
                                                                <button 
                                                                    onClick={() => onUpdateSelection(int.id, { ...sel, status: sel.status === 'not_eligible' ? undefined : 'not_eligible' })}
                                                                    className={`flex-1 text-xs py-1.5 rounded border transition-colors ${sel.status === 'not_eligible' ? 'bg-[#A4343A] text-white border-[#A4343A] font-bold' : 'border-slate-200 text-[#88888D] hover:bg-[#A4343A]/10 hover:text-[#A4343A] hover:border-[#A4343A]/30'}`}
                                                                >
                                                                    No
                                                                </button>
                                                                <button 
                                                                    onClick={() => onUpdateSelection(int.id, { ...sel, status: sel.status === 'conditional' ? undefined : 'conditional' })}
                                                                    className={`flex-1 text-xs py-1.5 rounded border transition-colors ${sel.status === 'conditional' ? 'bg-[#FFD100] text-black border-[#FFD100] font-bold' : 'border-slate-200 text-[#88888D] hover:bg-[#FFD100]/20 hover:text-[#E55025] hover:border-[#FFD100]/50'}`}
                                                                >
                                                                    If/When
                                                                </button>
                                                                <button 
                                                                    onClick={() => onUpdateSelection(int.id, { ...sel, status: sel.status === 'na' ? undefined : 'na' })}
                                                                    className={`flex-1 text-xs py-1.5 rounded border transition-colors ${sel.status === 'na' ? 'bg-[#88888D] text-white border-[#88888D] font-bold' : 'border-slate-200 text-[#88888D] hover:bg-slate-100 hover:text-black'}`}
                                                                >
                                                                    N/A
                                                                </button>
                                                            </div>
                                                            {sel.status && (
                                                            <input 
                                                                type="text"
                                                                placeholder="Add notes..."
                                                                className="w-full mt-2 text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-[#0099CC] focus:border-[#0099CC] transition-shadow"
                                                                value={sel.notes || ''}
                                                                onChange={(e) => onUpdateSelection(int.id, { ...sel, notes: e.target.value })}
                                                            />
                                                            )}
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    );
                })
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Report View with Export Logic ---

const ReportView: React.FC<ReportViewProps> = ({ selections, onHome, view, setView }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    levels: { pillar: true, subCategory: true, type: true, activity: true },
    elements: { definitions: true, criticality: true, notes: true }
  });

  const reportRef = useRef<HTMLDivElement>(null);

  const getFilteredInterventions = (status: string) => {
    return ALL_INTERVENTIONS.filter(i => (selections[i.id]?.status === status));
  };

  const eligibleItems = getFilteredInterventions('eligible');
  const conditionalItems = getFilteredInterventions('conditional');
  const notEligibleItems = getFilteredInterventions('not_eligible');

  const handleExport = () => {
    if (exportConfig.format === 'csv') {
      downloadCSV();
    } else if (exportConfig.format === 'pdf') {
      setTimeout(() => window.print(), 100);
    } else if (exportConfig.format === 'image') {
      alert("Image export is not supported in this environment. Please use 'Print / PDF' and select 'Save as Image' in your system dialog if available.");
    }
    setIsExportModalOpen(false);
  };

  const downloadCSV = () => {
    const headers = [];
    if (exportConfig.levels.pillar) headers.push('Pillar');
    if (exportConfig.levels.subCategory) headers.push('Sub-Category');
    if (exportConfig.levels.type) headers.push('Type');
    headers.push('Activity Name');
    headers.push('Selected Status');
    
    if (exportConfig.elements.criticality) {
       headers.push('Priority Label', 'Final Urgency', 'Final Condition');
    }
    if (exportConfig.elements.definitions) {
        if (exportConfig.levels.pillar) headers.push('Pillar Definition');
        if (exportConfig.levels.subCategory) headers.push('Sub-Category Definition');
        if (exportConfig.levels.type) headers.push('Type Definition');
    }
    if (exportConfig.elements.notes) headers.push('Notes');

    const rows = ALL_INTERVENTIONS.map(item => {
      const sel = selections[item.id] || {};
      const finalUrgency = sel.urgency || item.urgency;
      const finalCondition = sel.condition || item.condition;
      
      const getPriorityLabel = (u:string, c:string) => {
         if (!u || !c || u === 'N/A' || c === 'N/A') return 'N/A';
         const map:any = { 'Critical-Active': 'Priority 1', 'Emergent-Active': 'Priority 2', 'Non-Critical-Active': 'Priority 4', 'Critical-Passive': 'Priority 2', 'Emergent-Passive': 'Priority 3', 'Non-Critical-Passive': 'Priority 5', 'Critical-Inactive': 'Priority 3', 'Emergent-Inactive': 'Priority 5', 'Non-Critical-Inactive': 'Priority 6' };
         return map[`${u}-${c}`] || 'N/A';
      };

      const row = [];
      if (exportConfig.levels.pillar) row.push(item.pillarName);
      if (exportConfig.levels.subCategory) row.push(item.subCatName);
      if (exportConfig.levels.type) row.push(item.typeName);
      row.push(item.name);
      row.push(sel.status ? sel.status.replace('_', ' ').toUpperCase() : 'UNSELECTED');

      if (exportConfig.elements.criticality) {
          row.push(getPriorityLabel(finalUrgency, finalCondition), finalUrgency, finalCondition);
      }
      if (exportConfig.elements.definitions) {
          if (exportConfig.levels.pillar) row.push(item.pillarDescription || '');
          if (exportConfig.levels.subCategory) row.push(item.subCatDescription || '');
          if (exportConfig.levels.type) row.push(item.typeDescription || '');
      }
      if (exportConfig.elements.notes) row.push(sel.notes || '');

      return row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `repairs_catalog_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const GroupedList: React.FC<{ items: Intervention[] }> = ({ items }) => {
    if (items.length === 0) return <p className="italic text-[#88888D]">None selected.</p>;
    
    const grouped = items.reduce((acc, item) => {
      const key = `${item.pillarName}::${item.subCatName}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as { [key: string]: Intervention[] });

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([key, groupItems]) => {
          const [pillar, subCat] = key.split('::');
          return (
            <div key={key} className="break-inside-avoid">
              <h4 className="font-bold text-black border-b border-slate-200 pb-1 mb-3">
                  {exportConfig.levels.pillar && <span className="mr-2">{pillar}</span>} 
                  {exportConfig.levels.pillar && exportConfig.levels.subCategory && <span className="text-slate-400 mr-2">/</span>}
                  {exportConfig.levels.subCategory && <span>{subCat}</span>}
              </h4>
              
              {exportConfig.elements.definitions && (
                  <div className="mb-3 text-xs text-slate-500 italic">
                      {exportConfig.levels.pillar && <div><strong>Pillar:</strong> {groupItems[0].pillarDescription}</div>}
                      {exportConfig.levels.subCategory && <div><strong>Sub-Category:</strong> {groupItems[0].subCatDescription}</div>}
                  </div>
              )}

              <ul className="list-disc pl-5 space-y-4">
                {groupItems.map(item => {
                  const sel = selections[item.id] || {};
                  const urgency = sel.urgency || item.urgency;
                  const condition = sel.condition || item.condition;
                  
                   const getPriorityLabel = (u:string, c:string) => {
                        if (!u || !c || u === 'N/A' || c === 'N/A') return null;
                        const map:any = { 'Critical-Active': 'Priority 1', 'Emergent-Active': 'Priority 2', 'Non-Critical-Active': 'Priority 4', 'Critical-Passive': 'Priority 2', 'Emergent-Passive': 'Priority 3', 'Non-Critical-Passive': 'Priority 5', 'Critical-Inactive': 'Priority 3', 'Emergent-Inactive': 'Priority 5', 'Non-Critical-Inactive': 'Priority 6' };
                        return map[`${u}-${c}`];
                   };
                  const priority = getPriorityLabel(urgency, condition);

                  return (
                    <li key={item.id} className="text-sm text-black">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <span className="font-medium text-base">
                            {exportConfig.levels.type && <span className="text-slate-500 font-normal mr-2">[{item.typeName}]</span>}
                            {item.name}
                        </span>
                        {exportConfig.elements.criticality && priority && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                            priority.includes('Priority 1') ? 'bg-[#A4343A]/10 text-[#A4343A] border-[#A4343A]/20' :
                            priority.includes('Priority 2') ? 'bg-[#E55025]/10 text-[#E55025] border-[#E55025]/20' :
                            'bg-slate-100 text-[#88888D] border-slate-200'
                          }`}>
                            {priority}
                          </span>
                        )}
                      </div>
                      
                      {exportConfig.elements.criticality && (urgency !== 'N/A' && condition !== 'N/A') && (
                        <div className="text-xs text-[#88888D] mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 font-medium text-black">
                            Urgency: <span className="font-normal text-[#88888D]">{urgency}</span>
                          </span>
                          <span className="flex items-center gap-1 font-medium text-black">
                            Condition: <span className="font-normal text-[#88888D]">{condition}</span>
                          </span>
                        </div>
                      )}

                      {exportConfig.elements.notes && selections[item.id]?.notes && (
                        <div className="mt-1.5 bg-[#FFD100]/20 p-2 rounded border border-[#FFD100]/40 text-xs italic text-black">
                          <strong>Note:</strong> {selections[item.id].notes}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
        <ExportSidebar onHome={onHome} />
        <ExportModal 
            isOpen={isExportModalOpen} 
            onClose={() => setIsExportModalOpen(false)} 
            config={exportConfig}
            onConfigChange={setExportConfig}
            onExport={handleExport}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopNav view={view} setView={setView} />
            <div className="flex-1 overflow-y-auto bg-white p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8 print:hidden">
                        <div>
                        <h2 className="text-3xl font-bold text-black">Export Activities</h2>
                        <p className="text-[#88888D]">Review your selections and export your policy manual.</p>
                        </div>
                        <div>
                        <button 
                            onClick={() => setIsExportModalOpen(true)} 
                            className="flex items-center gap-2 px-6 py-3 bg-[#0099CC] text-white rounded-lg hover:bg-[#0099CC]/80 shadow-md transition-all font-bold"
                        >
                            <Settings size={20} /> Export Options
                        </button>
                        </div>
                    </div>

                    <div ref={reportRef} className="bg-white p-12 shadow-lg border border-slate-200 min-h-[1000px] print:shadow-none print:border-none print:p-0">
                        <div className="text-center border-b-2 border-black pb-6 mb-8">
                        <h1 className="text-3xl font-bold uppercase tracking-wide text-black">Appendix A: Construction Activities</h1>
                        <p className="text-[#88888D] mt-2">Generated via Repairs Catalog Builder</p>
                        <p className="text-sm text-[#88888D] mt-1">{new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="mb-8">
                        <h3 className="text-xl font-bold text-black bg-slate-100 p-2 mb-4 border-l-4 border-[#3AA047]">1. Eligible Repairs</h3>
                        <p className="mb-4 text-sm text-[#88888D]">The following activities have been approved for program funding and execution, subject to standard feasibility assessments.</p>
                        <GroupedList items={eligibleItems} />
                        </div>

                        <div className="mb-8">
                        <h3 className="text-xl font-bold text-black bg-slate-100 p-2 mb-4 border-l-4 border-[#FFD100]">2. Conditional Repairs</h3>
                        <p className="mb-4 text-sm text-[#88888D]">The following activities are eligible only when specific conditions are met (see notes).</p>
                        <GroupedList items={conditionalItems} />
                        </div>

                        <div className="mb-8">
                        <h3 className="text-xl font-bold text-black bg-slate-100 p-2 mb-4 border-l-4 border-[#A4343A]">3. Non-Eligible Activities</h3>
                        <p className="mb-4 text-sm text-[#88888D]">The following activities are strictly outside the current program scope.</p>
                        <GroupedList items={notEligibleItems} />
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-[#88888D]">
                        <p>End of Policy Section</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<'landing' | 'learn' | 'catalog' | 'report'>('landing');
  const [selections, setSelections] = useState<SelectionsMap>({});
  const [loading, setLoading] = useState(true);

  // Load Data from LocalStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const saved = localStorage.getItem('repair_catalog_selections');
        if (saved) {
          setSelections(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load selections", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Set Favicon & Preload Logo
  useEffect(() => {
    // Favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    const finalLink = link || document.createElement('link');
    finalLink.type = 'image/png';
    finalLink.rel = 'shortcut icon';
    finalLink.href = LOGO_URL;
    document.getElementsByTagName('head')[0].appendChild(finalLink);

    // Preload Image to reduce loading delay
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = LOGO_URL;
    document.head.appendChild(preloadLink);
  }, []);

  const handleUpdateSelection = (interventionId: string, data: Selection) => {
    setSelections(prev => {
      const next = { ...prev, [interventionId]: data };
      localStorage.setItem('repair_catalog_selections', JSON.stringify(next));
      return next;
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099CC]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-black flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {view === 'landing' && <LandingView onStart={() => setView('catalog')} onLearn={() => setView('learn')} />}
        {view === 'learn' && <LearnView onComplete={() => setView('catalog')} selections={selections} onHome={() => setView('landing')} view={view} setView={setView} />}
        {view === 'catalog' && <CatalogView selections={selections} onUpdateSelection={handleUpdateSelection} onHome={() => setView('landing')} view={view} setView={setView} />}
        {view === 'report' && <ReportView selections={selections} onHome={() => setView('landing')} view={view} setView={setView} />}
      </main>
    </div>
  );
}
