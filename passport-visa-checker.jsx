import { useState, useMemo } from "react";

const PASSPORT_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
  "Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba",
  "Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini",
  "Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana",
  "Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras",
  "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
  "Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia",
  "Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis",
  "Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Saudi Arabia",
  "Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia",
  "Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain",
  "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
  "Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia",
  "Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const tier1 = ["Germany","Sweden","Finland","France","Spain","Italy","Japan","Singapore","South Korea","United States","United Kingdom","Canada","Australia","New Zealand","Netherlands","Denmark","Norway","Switzerland","Austria","Belgium","Portugal","Luxembourg","Ireland","Iceland"];
const tier2 = ["Brazil","Argentina","Chile","Mexico","Malaysia","Israel","UAE","Qatar","Bahrain","Kuwait","Oman","Saudi Arabia","Russia","Romania","Bulgaria","Croatia","Poland","Hungary","Greece","Czech Republic","Slovakia","Slovenia","Estonia","Latvia","Lithuania"];
const tier3 = ["India","China","Turkey","South Africa","Thailand","Philippines","Indonesia","Vietnam","Egypt","Morocco","Tunisia","Jordan","Georgia","Ukraine","Serbia","Albania","Montenegro","North Macedonia","Bosnia and Herzegovina","Kosovo"];
const tier4 = ["Pakistan","Bangladesh","Nigeria","Ghana","Kenya","Ethiopia","Nepal","Sri Lanka","Myanmar","Cambodia","Laos","Afghanistan","Syria","Yemen","Somalia","Sudan","Eritrea","North Korea","Iran","Iraq","Libya"];
const schengen = ["Germany","France","Spain","Italy","Netherlands","Belgium","Austria","Portugal","Sweden","Finland","Denmark","Norway","Iceland","Switzerland","Luxembourg","Greece","Czech Republic","Slovakia","Slovenia","Estonia","Latvia","Lithuania","Hungary","Poland","Croatia","Romania","Bulgaria","Malta"];

const getTier = (p) => {
  if (tier1.includes(p)) return 1;
  if (tier2.includes(p)) return 2;
  if (tier3.includes(p)) return 3;
  if (tier4.includes(p)) return 4;
  return 3;
};

// ── TRANSIT VISA LOGIC ────────────────────────────────────────────────────────
const getTransitInfo = (passport, transitCountry) => {
  if (!passport || !transitCountry) return null;

  // Returning home — no transit visa needed for your own country
  if (passport === transitCountry) {
    return { required: false, type: "home_country", label: "No Transit Visa Required — Home Country", color: "#00c896", icon: "🏠", airside: false,
      description: `You are transiting through your home country (${transitCountry}). Citizens always have the right to enter their own country — no transit visa is ever required. You may freely pass through immigration.`,
      documents: ["Valid passport"], process: "No application needed. You have the unconditional right to enter your home country.", processingTime: "N/A", fee: "Free", maxTransit: "Unlimited",
      tips: ["Your passport guarantees entry to your home country","No transit visa or special permit is needed","You may exit the airport and travel freely","If your passport is expired, contact your embassy for an emergency travel document"] };
  }

  const pt = getTier(passport);
  const isSchengenTransit = schengen.includes(transitCountry);
  const isSchengenPassport = schengen.includes(passport);

  const atvList = ["Afghanistan","Bangladesh","Congo","Eritrea","Ethiopia","Ghana","Iran","Iraq","Nigeria","Pakistan","Somalia","Sri Lanka","Sudan","Syria","Turkey","Yemen","Zimbabwe","Colombia","Cuba","North Korea","Libya","Mali","Rwanda","Senegal","Sierra Leone","South Sudan","Myanmar","Guinea","Guinea-Bissau","Haiti","Kosovo","Liberia"];

  // Schengen Airport Transit Visa
  if (isSchengenTransit && isSchengenPassport) {
    return { required: false, type: "transit_free", label: "No Transit Visa Required", color: "#00c896", icon: "🟢", airside: false,
      description: `As a ${passport} citizen you move freely within the Schengen Area with no transit formalities.`,
      documents: ["Valid passport or national ID"], process: "No application needed.", processingTime: "N/A", fee: "Free", maxTransit: "Unrestricted",
      tips: ["No passport control between Schengen states","You may exit the airport and explore freely","Keep passport handy for non-Schengen onward flights"] };
  }

  if (isSchengenTransit && atvList.includes(passport)) {
    return { required: true, type: "airport_transit_visa", label: "Airport Transit Visa (ATV) Required", color: "#e05c5c", icon: "🔴", airside: true,
      description: `Citizens of ${passport} require an Airport Transit Visa (ATV) even when remaining in the international transit zone of a Schengen airport. You cannot board without it.`,
      documents: ["Valid passport (6+ months validity)","Completed ATV application form","2 passport-size photographs","Confirmed onward flight ticket","Valid visa/permit for final destination","Proof of financial means","Travel insurance (recommended)"],
      process: "1. Apply at the embassy/consulate of the Schengen transit country\n2. Submit ATV application form with all documents\n3. Pay ATV fee\n4. Receive ATV sticker in passport\n5. Present ATV at check-in and transit immigration",
      processingTime: "5–15 business days", fee: "€80 (standard Schengen ATV fee)", maxTransit: "Up to 24 hours in transit zone",
      tips: ["ATV required even if you never leave the airport","Holding a valid US/Schengen visa may exempt you — verify","Each Schengen country may have slightly different ATV lists","If transiting multiple Schengen countries, one ATV covers all","Apply well in advance — same-day applications not accepted"] };
  }

  if (isSchengenTransit && pt === 1) {
    return { required: false, type: "transit_free", label: "No Transit Visa Required", color: "#00c896", icon: "🟢", airside: false,
      description: `Citizens of ${passport} can transit through Schengen airports without a visa. You may also exit the airport in most Schengen countries.`,
      documents: ["Valid passport","Onward flight ticket"], process: "No application needed. Proceed to connecting gate or exit the airport freely.",
      processingTime: "N/A", fee: "Free", maxTransit: "Typically up to 90 days",
      tips: ["You may freely exit into the Schengen city during a layover","No passport control between Schengen states","A short-stay Schengen visa is needed if staying longer than 90 days"] };
  }

  // UK Transit
  if (transitCountry === "United Kingdom") {
    const datvList = ["Afghanistan","Albania","Algeria","Angola","Bangladesh","Belarus","Bolivia","Burundi","Cambodia","Cameroon","China","Colombia","Cuba","Democratic Republic of Congo","Djibouti","Ecuador","Egypt","Eritrea","Ethiopia","Ghana","Guinea","Haiti","India","Indonesia","Iran","Iraq","Jamaica","Jordan","Kenya","Kosovo","Laos","Lebanon","Libya","Myanmar","Nepal","Niger","Nigeria","North Korea","North Macedonia","Pakistan","Philippines","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Somalia","South Sudan","Sri Lanka","Sudan","Syria","Tanzania","Thailand","Turkey","Turkmenistan","Uganda","Uzbekistan","Vietnam","Yemen","Zambia","Zimbabwe"];
    if (datvList.includes(passport)) {
      return { required: true, type: "direct_airside_transit", label: "Direct Airside Transit Visa (DATV) Required", color: "#e05c5c", icon: "🔴", airside: true,
        description: `Citizens of ${passport} require a Direct Airside Transit Visa (DATV) to transit through any UK airport, even without leaving the international departure lounge.`,
        documents: ["Valid passport","DATV application form (via UKVI online)","Passport-size photograph","Confirmed onward flight ticket","Valid visa for final destination","Proof of finances"],
        process: "1. Apply online at gov.uk/transit-visa\n2. Complete UKVI online form\n3. Upload documents and photograph\n4. Pay DATV fee\n5. Receive decision by email\n6. Print and carry approval letter",
        processingTime: "3–8 weeks", fee: "£64", maxTransit: "Up to 24 hours (airside only)",
        tips: ["Apply only on the official gov.uk website","A valid US, Canadian, Australian, or Schengen visa may exempt you","DATV needed even for a 1-hour connection","To exit the airport you need a Standard Visitor Visa instead","Biometric enrollment may be required at a visa application centre"] };
    }
    return { required: false, type: "transit_free", label: "No Transit Visa Required", color: "#00c896", icon: "🟢", airside: false,
      description: `Citizens of ${passport} can transit through UK airports without a visa, provided you remain in the international zone and connect within 24 hours.`,
      documents: ["Valid passport","Confirmed onward ticket"], process: "No application needed. Proceed directly to your connecting gate.",
      processingTime: "N/A", fee: "Free", maxTransit: "Up to 24 hours (airside without visa)",
      tips: ["Don't leave the airport without a Standard Visitor Visa","Keep onward ticket accessible","Border Force officers may ask about your onward journey"] };
  }

  // US Transit
  if (transitCountry === "United States") {
    const vwpCountries = [...tier1,"Chile","Taiwan"];
    if (vwpCountries.includes(passport)) {
      return { required: false, type: "esta_required", label: "ESTA Required (Visa Waiver Program)", color: "#f5a623", icon: "🟡", airside: false,
        description: `Citizens of ${passport} qualify for the US Visa Waiver Program. You must obtain ESTA approval before boarding — it's not a visa but mandatory pre-travel authorization. Note: the US has NO airside transit zone; all passengers pass through US immigration.`,
        documents: ["Valid e-Passport (with biometric chip)","ESTA approval (esta.cbp.dhs.gov)","Return/onward ticket","Proof of sufficient funds"],
        process: "1. Visit esta.cbp.dhs.gov\n2. Complete ESTA application online\n3. Pay $21 USD fee\n4. Receive approval (usually instant, up to 72 hrs)\n5. Travel with ESTA approval and valid e-Passport",
        processingTime: "Instant to 72 hours", fee: "$21 USD", maxTransit: "Up to 90 days per visit",
        tips: ["Apply for ESTA at least 72 hours before departure","ESTA valid for 2 years or until passport expiry","Must hold a valid e-Passport with biometric chip","ESTA denial means you must apply for a full US visa"] };
    }
    return { required: true, type: "us_transit_visa", label: "US Transit Visa (C-1) Required", color: "#e05c5c", icon: "🔴", airside: false,
      description: `The United States has NO airside transit zone. All transit passengers must clear US immigration. Citizens of ${passport} require a C-1 Transit Visa or B-2 Tourist Visa — even for a 1-hour layover at JFK, LAX, or ORD.`,
      documents: ["Valid passport (6+ months)","DS-160 online nonimmigrant visa application","Passport-size photograph (US specifications)","Application fee receipt (MRV fee)","Interview appointment confirmation","Onward flight ticket proof","Proof of funds","Ties to home country (employment, property, family)"],
      process: "1. Complete DS-160 form at ceac.state.gov\n2. Pay MRV fee ($160 USD)\n3. Schedule visa interview at US Embassy/Consulate\n4. Attend in-person interview\n5. Provide biometrics\n6. Await decision (5–15 business days after interview)\n7. Collect passport with visa",
      processingTime: "2–8 weeks (interview wait times vary widely)", fee: "$160 USD (non-refundable MRV fee)", maxTransit: "Up to 29 days (C-1 Visa)",
      tips: ["US has NO airside transit — a visa is mandatory for non-VWP nationals","A B-2 tourist visa is more flexible and also permits transit","Interview wait times can be 6–12 months at some embassies — plan far ahead","Even a 1-hour layover requires a US visa if you're not VWP-exempt"] };
  }

  // UAE Transit
  if (transitCountry === "United Arab Emirates") {
    if (pt <= 2) {
      return { required: false, type: "transit_free", label: "No Transit Visa Required", color: "#00c896", icon: "🟢", airside: false,
        description: `Citizens of ${passport} can transit through Dubai (DXB) and Abu Dhabi (AUH) without a visa. You may even exit the airport and explore the UAE for up to 96 hours.`,
        documents: ["Valid passport","Onward flight ticket"], process: "No application needed. Exit immigration freely or proceed to connecting gate.",
        processingTime: "N/A", fee: "Free", maxTransit: "Up to 96 hours (landside access permitted)",
        tips: ["Dubai is one of the world's most transit-friendly airports","You can explore Dubai during a long layover","Keep onward ticket accessible for immigration"] };
    }
    return { required: false, type: "transit_free", label: "Airside Transit — No Visa Needed", color: "#00c896", icon: "🟢", airside: true,
      description: `Citizens of ${passport} can transit through UAE airports in the international zone without a visa, provided you do not exit immigration.`,
      documents: ["Valid passport","Onward flight ticket"], process: "No application needed. Remain in the international transit zone.",
      processingTime: "N/A", fee: "Free", maxTransit: "Up to 24 hours (airside only)",
      tips: ["Do not exit the airport without a UAE visa","Transit is smooth at Dubai and Abu Dhabi airports"] };
  }

  // General fallback
  if (pt === 1) {
    return { required: false, type: "transit_free", label: "No Transit Visa Required", color: "#00c896", icon: "🟢", airside: false,
      description: `Citizens of ${passport} generally do not require a transit visa for ${transitCountry}. You may typically exit the airport during a layover.`,
      documents: ["Valid passport","Onward flight ticket"], process: "No application required. Proceed normally.",
      processingTime: "N/A", fee: "Free", maxTransit: "Typically 24–72 hours",
      tips: ["Confirm with airline before travel","Keep onward ticket accessible","Rules can change — always verify"] };
  }

  if (pt >= 3 && getTier(transitCountry) === 1) {
    return { required: true, type: "transit_visa", label: "Transit Visa Likely Required", color: "#f5a623", icon: "🟡", airside: true,
      description: `Citizens of ${passport} may require a transit visa to pass through ${transitCountry}, even remaining airside. Requirements depend on the specific country policy.`,
      documents: ["Valid passport (6+ months)","Transit visa application form","Passport photographs","Confirmed onward flight ticket","Valid visa for final destination","Proof of financial means"],
      process: "1. Check embassy/consulate website of the transit country\n2. Confirm if a transit visa is required for your nationality\n3. Submit application with all documents\n4. Pay fee\n5. Receive transit visa before travel",
      processingTime: "3–10 business days", fee: "$30–$100 USD", maxTransit: "24–72 hours",
      tips: ["Verify with the specific country's immigration authority","A valid visa for your final destination may exempt you","Contact your airline — they must confirm documents before boarding","Some countries have different rules for airside vs landside transit"] };
  }

  return { required: false, type: "transit_free", label: "No Transit Visa Required", color: "#00c896", icon: "🟢", airside: false,
    description: `Citizens of ${passport} can generally transit through ${transitCountry} without a transit visa for short connections.`,
    documents: ["Valid passport","Onward flight ticket"], process: "No application needed. Transit directly to your connecting flight.",
    processingTime: "N/A", fee: "Free", maxTransit: "Typically up to 24 hours",
    tips: ["Verify with airline before travel","Keep onward ticket accessible","Rules can change without notice"] };
};

// ── DESTINATION VISA LOGIC ────────────────────────────────────────────────────
const getVisaInfo = (passport, destination) => {
  if (passport === destination) return {
    type: "home_country", label: "Home Country — No Visa Needed", stay: "Unlimited", color: "#00c896", icon: "🏠",
    description: `${destination} is your home country. You have the unconditional right to enter and stay without any visa, permit, or time restriction.`,
    documents: ["Valid passport (even an expired one may be accepted at some borders — check with your airline)"],
    process: "No application required. Simply present your passport at immigration.",
    processingTime: "N/A", fee: "Free",
    tips: ["Citizens cannot be denied entry to their own country","Even an expired passport is often accepted for returning nationals","If your passport is lost/stolen abroad, contact your embassy for an Emergency Travel Document","Some airlines require a valid passport to board — check before flying"]
  };
  const pt = getTier(passport);
  const dt = getTier(destination);

  if (schengen.includes(passport) && schengen.includes(destination)) return {
    type: "visa_free", label: "Visa Free", stay: "Unlimited (EU/Schengen citizen)", color: "#00c896", icon: "✈️",
    description: "As a Schengen/EU citizen, you travel freely without visa restrictions.",
    documents: ["Valid passport or national ID card"],
    process: "No application required. Travel with your valid travel document.",
    processingTime: "N/A", fee: "Free",
    tips: ["Keep your ID/passport valid","No immigration checks at Schengen borders","Some destinations may require passport (not just ID)"]
  };

  const matrix = {
    "1-1": { type:"visa_free", label:"Visa Free", stay:"Up to 90 days", color:"#00c896", icon:"✈️", description:"Citizens with this passport enter without a visa for tourism and short stays.", documents:["Valid passport (6+ months validity)","Return/onward ticket","Proof of sufficient funds","Travel insurance (recommended)"], process:"No pre-arranged visa needed. Present your passport at immigration on arrival.", processingTime:"N/A — entry at border", fee:"Free", tips:["Ensure passport is valid 6+ months beyond stay","Don't exceed permitted stay","Keep proof of funds handy"] },
    "1-2": { type:"visa_free", label:"Visa Free", stay:"30–90 days", color:"#00c896", icon:"✈️", description:"Strong passport holders enjoy visa-free access for tourism.", documents:["Valid passport","Return ticket","Hotel booking or host letter","Sufficient funds proof"], process:"No visa required. Immigration officer may ask for supporting documents.", processingTime:"N/A", fee:"Free", tips:["Carry hotel bookings","Show return ticket if asked","Don't overstay"] },
    "1-3": { type:"e_visa", label:"e-Visa / Visa on Arrival", stay:"30 days", color:"#f5a623", icon:"🖥️", description:"An electronic visa or visa on arrival is available. Apply online before travel or at the airport.", documents:["Valid passport (6+ months)","Passport-size photo","Return ticket","Hotel booking confirmation","Travel insurance","Credit/debit card for fee payment","Completed online application form"], process:"1. Visit the official e-Visa portal of the destination country\n2. Fill in personal and travel details\n3. Upload passport copy and photo\n4. Pay the visa fee online\n5. Receive e-Visa via email (print or keep digital copy)\n6. Present at immigration on arrival", processingTime:"24–72 hours (apply 5+ days before travel)", fee:"$20–$75 USD", tips:["Apply on official government website only","Keep digital and printed copy of approval","Some airports may not offer on-arrival option — check in advance"] },
    "1-4": { type:"visa_required", label:"Visa Required", stay:"As per visa grant", color:"#e05c5c", icon:"🏛️", description:"A full visa application through the embassy or consulate is required.", documents:["Valid passport (6+ months beyond trip)","Completed visa application form","Recent passport photos (2–4)","Flight itinerary (tentative)","Hotel/accommodation proof","Bank statements (3–6 months)","Income proof / employment letter","Travel insurance","Cover letter stating purpose","Invitation letter (if applicable)"], process:"1. Locate the nearest embassy or consulate\n2. Download and complete the official visa application form\n3. Gather all required documents\n4. Book an appointment (if required)\n5. Attend in-person interview (if required)\n6. Submit documents and pay fee\n7. Track application status\n8. Collect visa or receive notification", processingTime:"5–15 business days (apply 4–6 weeks in advance)", fee:"$50–$200 USD", tips:["Apply well in advance","Be truthful in all forms","Carry originals + photocopies","Some countries require biometric data","Check if transit visa is also needed"] },
    "2-1": { type:"visa_required", label:"Visa Required", stay:"As per visa", color:"#e05c5c", icon:"🏛️", description:"Embassy/consulate visa required for entry.", documents:["Valid passport (6+ months)","Visa application form","2–4 passport photos","Proof of accommodation","Return flight booking","Bank statements (last 3 months)","Travel insurance","Employment/income proof","Proof of ties to home country"], process:"1. Find the embassy/consulate of destination\n2. Book an appointment\n3. Complete application form\n4. Gather all supporting documents\n5. Pay visa fee\n6. Attend biometrics/interview if required\n7. Await decision\n8. Collect visa sticker in passport", processingTime:"10–21 business days", fee:"$80–$200 USD", tips:["Strong home ties help approval chances","Show proof of income and stable employment","Don't book non-refundable tickets before approval","Some embassies require bank balance 3x the daily limit"] },
    "2-2": { type:"visa_free", label:"Visa Free / Visa on Arrival", stay:"30–60 days", color:"#00c896", icon:"✈️", description:"Visa-free or visa-on-arrival access available.", documents:["Valid passport","Return ticket","Proof of accommodation","Small amount of local or USD currency"], process:"Visa on arrival: proceed to VoA counter, fill arrival card, pay fee, receive stamp.", processingTime:"15–30 mins at airport", fee:"Free or $10–$30 USD", tips:["Have USD cash ready for on-arrival fee","Fill out arrival card on the plane","Keep a small amount of destination currency"] },
    "2-3": { type:"e_visa", label:"e-Visa / Visa on Arrival", stay:"30 days", color:"#f5a623", icon:"🖥️", description:"e-Visa or visa on arrival typically available.", documents:["Valid passport","Passport photo","Return ticket","Hotel booking","Fee payment method"], process:"1. Check destination's official e-Visa portal\n2. Fill application and upload documents\n3. Pay fee and receive approval\n4. Present at immigration on arrival", processingTime:"24–72 hours", fee:"$20–$50 USD", tips:["Check if e-Visa is available to avoid airport queues","Carry USD as backup","Keep accommodation proof handy"] },
    "3-1": { type:"visa_required", label:"Visa Required", stay:"As per visa", color:"#e05c5c", icon:"🏛️", description:"Full embassy visa required. Prepare thorough documentation — scrutiny may be higher.", documents:["Valid passport (6+ months)","Completed visa application form","Recent passport photos (2–4)","Travel itinerary","Hotel/accommodation confirmation","Bank statements (6 months)","Income tax returns or employment letter","Payslips (last 3 months)","Travel insurance (mandatory for Schengen, €30,000+)","Cover letter explaining visit","Proof of ties to home country","Invitation letter (if applicable)","No objection certificate (if employed)"], process:"1. Gather all documents listed\n2. Check consulate appointment availability early\n3. Book and attend appointment\n4. Submit documents + biometrics\n5. Pay visa fee\n6. Track via VFS/TLScontact or embassy portal\n7. Collect passport with visa decision", processingTime:"15–30 business days", fee:"$80–$160 USD", tips:["Book appointment months in advance for peak seasons","Show strong financial and personal ties to home country","Mandatory Schengen travel insurance: €30,000+ coverage","Apply for single entry first if first-time applicant","Don't book any non-refundable travel before approval"] },
    "3-2": { type:"visa_required", label:"Visa Required", stay:"As per visa", color:"#e05c5c", icon:"🏛️", description:"Visa required before travel.", documents:["Valid passport","Visa application form","Passport photos","Bank statements","Return ticket","Travel insurance","Employment proof"], process:"1. Contact the embassy/consulate\n2. Gather all documents\n3. Submit application and pay fee\n4. Track and collect visa", processingTime:"7–14 business days", fee:"$50–$120 USD", tips:["Apply early","Carry all supporting documents","Verify specific requirements on embassy website"] },
    "3-3": { type:"visa_on_arrival", label:"Visa on Arrival / e-Visa", stay:"15–30 days", color:"#f5a623", icon:"🛬", description:"Most similar-tier countries offer visa on arrival or e-visa options.", documents:["Valid passport","Passport photo","Return ticket","Hotel booking","Fee in USD or local currency"], process:"Visa on Arrival: Present at VoA counter with documents, fill form, pay fee, receive stamp. OR apply e-Visa online before traveling.", processingTime:"Immediate (VoA) or 48–72 hours (e-Visa)", fee:"$15–$50 USD", tips:["Check if destination has e-Visa option to save airport time","Carry USD as backup payment","Keep accommodation proof handy"] },
    "4-1": { type:"visa_required", label:"Visa Required", stay:"As per visa", color:"#e05c5c", icon:"🏛️", description:"Visa required. Applications typically face high scrutiny — prepare exceptionally thorough documentation.", documents:["Valid passport (6+ months)","Visa application form","Multiple passport photos","Detailed travel itinerary","Hotel/accommodation proof","Bank statements (6–12 months, healthy balance)","Income tax returns (2–3 years)","Employment letter on company letterhead","Payslips (6 months)","Property ownership documents","Family ties proof","Sponsor/invitation letter","Travel insurance (€30,000+ for Schengen)","No Objection Certificate from employer"], process:"1. Begin gathering documents 2–3 months in advance\n2. Book appointment (expect long wait times)\n3. Submit at embassy/VFS center\n4. Provide biometrics\n5. Attend interview if called\n6. Track application\n7. Collect result", processingTime:"21–45 business days", fee:"$100–$200 USD", tips:["Strong financials are crucial — show consistent income","Demonstrate clear intent to return home","Book appointment as early as possible","Apply for shorter stays first","Rejection rates are higher — consider a visa consultant","Don't book non-refundable travel before approval"] },
    "4-3": { type:"visa_on_arrival", label:"Visa on Arrival", stay:"14–30 days", color:"#f5a623", icon:"🛬", description:"Visa on arrival typically available for this passport-destination pair.", documents:["Valid passport","Passport photo","Return ticket","Small fee in USD"], process:"Proceed to VoA counter at airport, fill form, pay fee, receive stamp.", processingTime:"Immediate", fee:"$15–$40 USD", tips:["Carry USD in cash","Complete arrival card on the plane","Keep accommodation details available"] },
  };

  const key = `${pt}-${dt}`;
  if (matrix[key]) return matrix[key];

  if (pt <= dt) {
    return { type:"visa_free", label:"Visa Free", stay:"30–90 days", color:"#00c896", icon:"✈️", description:"Visa-free access available for this passport-destination combination.", documents:["Valid passport","Return ticket","Proof of funds"], process:"No visa needed. Present passport at immigration.", processingTime:"N/A", fee:"Free", tips:["Keep passport valid","Carry return ticket","Have funds proof available"] };
  }
  return { type:"visa_required", label:"Visa Required", stay:"As per visa", color:"#e05c5c", icon:"🏛️", description:"A visa must be obtained prior to travel.", documents:["Valid passport","Visa application form","Passport photos","Proof of finances","Return ticket","Travel insurance","Employment/income proof"], process:"1. Contact embassy/consulate\n2. Submit application with documents\n3. Pay fee\n4. Await decision", processingTime:"10–21 business days", fee:"$50–$150 USD", tips:["Apply early","Carry all supporting documents","Check embassy requirements carefully"] };
};

const getPassportStrength = (passport) => {
  if (tier1.includes(passport)) return { rank: "Tier 1 — World's Strongest", score: 95, visaFree: "185–193", color: "#00c896" };
  if (tier2.includes(passport)) return { rank: "Tier 2 — Strong Passport", score: 72, visaFree: "120–165", color: "#4fc3f7" };
  if (tier3.includes(passport)) return { rank: "Tier 3 — Moderate Passport", score: 48, visaFree: "60–110", color: "#f5a623" };
  if (tier4.includes(passport)) return { rank: "Tier 4 — Limited Access", score: 22, visaFree: "20–50", color: "#e05c5c" };
  return { rank: "Tier 3 — Moderate Passport", score: 50, visaFree: "60–100", color: "#f5a623" };
};

// ── VISA TYPES FOR A SPECIFIC DESTINATION ─────────────────────────────────────
const getDestinationVisaTypes = (passport, destination) => {
  if (!passport || !destination) return [];
  if (passport === destination) return [];

  const pt = getTier(passport);
  const dt = getTier(destination);
  const isSchengenDest = schengen.includes(destination);
  const isSchengenPP   = schengen.includes(passport);

  // Helper: builds a visa entry
  const v = (id, icon, name, color, desc, howToApply, docs, duration, fee, processingTime, workAllowed, tips) =>
    ({ id, icon, name, color, desc, howToApply, docs, duration, fee, processingTime, workAllowed, tips });

  const visas = [];

  // ── TOURIST / VISITOR ────────────────────────────────────────────────────────
  const touristHow = pt === 1
    ? (isSchengenDest && isSchengenPP ? "No application needed. Travel with your ID or passport." : "No prior visa needed. Present passport at immigration on arrival.")
    : pt <= 2 && dt <= 2
      ? "Visa on arrival or e-Visa. Proceed to VoA counter or apply online before travel."
      : "Apply at the embassy/consulate with supporting documents. Book appointment online.";
  const touristDocs = pt >= 3 && dt <= 2
    ? ["Valid passport (6+ months)","Completed application form","2–4 passport photos","Return flight ticket","Hotel booking/accommodation proof","Bank statements (3–6 months)","Travel insurance","Cover letter stating purpose","Proof of employment/income","NOC from employer (if applicable)"]
    : ["Valid passport","Return flight ticket","Proof of accommodation","Proof of sufficient funds"];
  visas.push(v(
    "tourist","🏖️","Tourist / Visitor Visa","#4fc3f7",
    `For leisure travel, sightseeing, and visiting friends or family in ${destination}.`,
    touristHow, touristDocs,
    pt === 1 ? "Up to 90 days" : pt === 2 ? "30–60 days" : "15–30 days (as granted)",
    pt >= 3 && dt <= 2 ? "$80–$160 USD" : pt <= 2 && dt <= 2 ? "Free – $30" : "Free",
    pt >= 3 && dt <= 2 ? "15–30 business days" : pt <= 2 ? "Immediate – 72 hrs" : "N/A",
    false,
    pt >= 3 && dt <= 2
      ? [`Book your consulate appointment well in advance — slots fill fast for ${destination}`,"Show strong ties to home country (property, family, employment)","Carry originals + photocopies of all documents","Travel insurance with €30k+ coverage mandatory for Schengen countries","Do NOT book non-refundable travel before visa approval"]
      : ["Keep your passport valid for at least 6 months beyond your stay","Carry hotel bookings and return ticket at immigration","Don't overstay — it can affect future visa applications"]
  ));

  // ── BUSINESS ─────────────────────────────────────────────────────────────────
  visas.push(v(
    "business","💼","Business Visa","#a78bfa",
    `For attending meetings, conferences, trade events, or negotiations in ${destination}. Does not permit employment.`,
    pt <= 2 && dt <= 2
      ? "Often the same entry as tourist. An invitation letter from the host company may be requested."
      : `Apply at the ${destination} embassy/consulate. Invitation letter from the host company is usually mandatory.`,
    ["Valid passport (6+ months)","Invitation letter from host company in "+ destination,"Proof of your company/employment","Bank statements","Return ticket","Travel insurance","Visa application form","Passport photos"],
    "Duration of business activity (typically 14–90 days)",
    pt >= 3 ? "$80–$180 USD" : "Free – $50",
    pt >= 3 && dt <= 2 ? "10–21 business days" : "3–10 business days",
    false,
    ["Business visa does NOT permit paid employment in "+ destination,"Carry the original invitation letter — immigration may ask for it","Multiple-entry business visas are available in many countries for frequent travellers","Some countries issue a combined tourist/business entry — check with the embassy"]
  ));

  // ── WORK / EMPLOYMENT ────────────────────────────────────────────────────────
  const workNames = {
    "United States": "H-1B / L-1 / O-1 Work Visa",
    "United Kingdom": "Skilled Worker Visa",
    "Canada": "LMIA Work Permit",
    "Australia": "Temporary Skill Shortage (TSS 482)",
    "Germany": "EU Blue Card / Work Visa",
    "Singapore": "Employment Pass (EP)",
    "UAE": "UAE Employment Visa",
    "France": "Talent Passport / Work Permit",
    "Netherlands": "Highly Skilled Migrant Visa",
    "Japan": "Work Visa (Engineer / Specialist)",
  };
  const workName = workNames[destination] || `Work / Employment Visa — ${destination}`;
  visas.push(v(
    "work","👷", workName,"#fbbf24",
    `For taking up paid employment with an employer in ${destination}. A job offer is almost always required before applying.`,
    `Obtain a job offer from a ${destination}-based employer. Employer typically initiates or sponsors the visa. Apply at the ${destination} embassy or online portal with your job offer letter.`,
    ["Valid passport (6+ months)","Job offer / employment contract from "+ destination +" employer","Educational qualifications & certificates","Skills assessment (if required)","Medical examination (some countries)","Police clearance certificate","Passport photos","Visa application form","Proof of finances"],
    "1–3 years (usually renewable)",
    pt >= 3 ? "$150–$400 USD" : "$50–$200 USD",
    "4–12 weeks (varies significantly by country)",
    true,
    [`Job offer from a ${destination} employer is almost always mandatory`,"Qualifications may need to be assessed or recognised by the destination country","Work permits are often tied to a specific employer — switching jobs requires a new permit","Dependent family visas are usually available alongside the work visa","Some countries (e.g. US H-1B) have annual caps and lottery systems — plan far ahead"]
  ));

  // ── STUDENT ──────────────────────────────────────────────────────────────────
  const studentNames = {
    "United States": "F-1 Student Visa",
    "United Kingdom": "UK Student Visa",
    "Canada": "Canadian Student Permit",
    "Australia": "Student Visa (Subclass 500)",
    "Germany": "German Student Visa",
    "France": "VLS-TS Student Visa",
    "Ireland": "Student Permission (Stamp 2)",
    "Netherlands": "MVV Student Visa",
    "New Zealand": "Fee Paying Student Visa",
    "Singapore": "Student Pass",
  };
  const studentName = studentNames[destination] || `Student Visa — ${destination}`;
  visas.push(v(
    "student","🎓", studentName,"#34d399",
    `For enrolling in a full-time course at a recognised educational institution in ${destination}.`,
    `1. Get accepted by a recognised institution in ${destination}\n2. Receive your offer/acceptance letter (e.g. CAS in UK, I-20 in US)\n3. Apply for student visa at the embassy or online\n4. Attend biometric appointment\n5. Await decision`,
    ["Valid passport (6+ months)","Unconditional offer/acceptance letter from institution in "+ destination,"Proof of tuition fee payment or sponsorship","Bank statements showing sufficient funds for tuition + living costs","English language test results (IELTS/TOEFL if applicable)","Academic transcripts and certificates","Statement of Purpose","Health insurance","Passport photos","Visa application form"],
    "Duration of course + grace period",
    "$150–$500 USD (application fee varies)",
    "3–8 weeks",
    "Part-time (usually 20 hrs/week during term)",
    ["Secure admission first — acceptance letter is mandatory before applying","Show sufficient funds to cover full tuition + living costs","Part-time work rights vary — check exact rules for "+ destination,"Apply 3–6 months before your course start date","Health/medical insurance is usually mandatory"]
  ));

  // ── DIGITAL NOMAD ────────────────────────────────────────────────────────────
  const nomadCountries = ["Portugal","Spain","Germany","Costa Rica","Barbados","Bermuda","Estonia","Iceland","Greece","Czech Republic","United Arab Emirates","Thailand","Indonesia","Mexico","Colombia","Panama","Malaysia","Croatia","Malta","Mauritius","Georgia","Albania","Serbia","South Africa","Anguilla","Cayman Islands","Belize","Antigua and Barbuda","Dominica","Saint Lucia","Sri Lanka","Japan","South Korea","Singapore","Brazil","Argentina","Chile","Uruguay","Peru"];
  if (nomadCountries.includes(destination)) {
    visas.push(v(
      "digital_nomad","💻","Digital Nomad / Remote Work Visa","#e879f9",
      `${destination} offers a dedicated Digital Nomad or Remote Work Visa for people employed by or running a business based outside ${destination}.`,
      `Apply online or at the ${destination} embassy/consulate. Requires proof of remote employment and sufficient monthly income. No local job offer needed.`,
      ["Valid passport (6+ months)","Proof of remote employment or freelance contracts","Bank statements showing min. $2,000–$3,500/month income","Employment contract or business registration","Health insurance policy","Clean criminal record / police clearance","Completed visa application form","Passport photos"],
      "6 months – 2 years (varies, often renewable)",
      "$100–$500 USD",
      "2–8 weeks",
      "Remote work for foreign employers only (not local)",
      [`${destination}'s digital nomad visa is open to most nationalities including ${passport}`,"Minimum income requirements vary — typically $2,000–$3,500/month","You may NOT work for or be employed by a "+ destination +"-based company on this visa","Health insurance covering your entire stay is mandatory","Tax treaties may apply — consult a tax advisor about your obligations in both countries"]
    ));
  }

  // ── INVESTOR / GOLDEN VISA ───────────────────────────────────────────────────
  const investorCountries = {
    "Portugal": { name:"Golden Visa (ARI)", amount:"€250k–€500k+", type:"Real estate, fund investment, or job creation" },
    "Greece": { name:"Golden Visa", amount:"€250k+", type:"Real estate investment" },
    "Spain": { name:"Golden Visa", amount:"€500k+", type:"Real estate investment" },
    "Malta": { name:"Malta Permanent Residency Programme", amount:"€150k–€300k+", type:"Property + government contribution" },
    "United Arab Emirates": { name:"UAE Golden Visa", amount:"AED 2M+ (~$545k)", type:"Real estate or exceptional talent" },
    "Turkey": { name:"Turkish Citizenship by Investment", amount:"$400k+", type:"Real estate investment" },
    "United States": { name:"EB-5 Investor Visa", amount:"$800k–$1.05M", type:"Job-creating commercial enterprise" },
    "United Kingdom": { name:"Innovator Founder / Global Talent Visa", amount:"Varies", type:"Business innovation or exceptional talent" },
    "Singapore": { name:"Global Investor Programme (GIP)", amount:"SGD 2.5M+", type:"Business investment or GIP fund" },
    "Australia": { name:"Business Innovation & Investment Visa (188)", amount:"AUD 1.25M+", type:"Business or investment stream" },
    "Canada": { name:"Start-up Visa / Provincial Investor Programs", amount:"CAD 200k–800k", type:"Varies by province" },
    "Germany": { name:"Investor Residence Permit", amount:"Viable business plan", type:"Job-creating business" },
    "Ireland": { name:"Immigrant Investor Programme (IIP)", amount:"€1M+", type:"Enterprise investment or fund" },
    "New Zealand": { name:"Active Investor Plus Visa", amount:"NZD 5M+", type:"Acceptable investment assets" },
  };
  if (investorCountries[destination]) {
    const inv = investorCountries[destination];
    visas.push(v(
      "investor","💰", inv.name,"#fcd34d",
      `${destination} offers a residency or citizenship pathway through investment. Minimum investment: ${inv.amount} via ${inv.type.toLowerCase()}.`,
      `Engage a licensed immigration lawyer in ${destination}. Complete investment, gather documentation, and apply at the relevant authority or embassy. Processing is lengthy — plan 6–24 months.`,
      ["Valid passport","Proof of investment (title deeds, fund certificates, bank transfers)","Source of funds declaration","Criminal background check","Medical examination","Legal/notarised translations of all documents","Proof of health insurance","Tax compliance certificate from home country"],
      "Permanent Residency or Citizenship (program dependent)",
      inv.amount,
      "6–24 months",
      "Typically yes, with full residency",
      [`Minimum investment: ${inv.amount} (${inv.type})`,"Engage a licensed immigration attorney — this process is complex and high-stakes","Source of funds must be clearly documented and legally obtained","Processing times are long — start at least 1–2 years before intended move date","Some programs offer full citizenship, others only temporary/permanent residency","Tax residency implications — seek professional advice before committing"]
    ));
  }

  // ── FAMILY / DEPENDENT ───────────────────────────────────────────────────────
  visas.push(v(
    "family","👨‍👩‍👧","Family Reunion / Dependent Visa","#fb923c",
    `For joining a family member (spouse, parent, or child) who is a citizen or legal resident of ${destination}.`,
    `The sponsor (your family member in ${destination}) typically initiates the application. They must prove they meet the income/accommodation threshold. You apply at the ${destination} embassy with relationship documents.`,
    ["Valid passport (6+ months)","Proof of relationship (marriage certificate, birth certificate)","Sponsor's proof of citizenship or legal residency in "+ destination,"Sponsor's proof of income meeting minimum threshold","Proof of suitable accommodation in "+ destination,"Biometric data / photos","Police clearance certificate","Medical examination (in some countries)","Visa application form"],
    "Varies (temporary to permanent, depends on sponsor status)",
    pt >= 3 ? "$150–$400 USD" : "$50–$200 USD",
    "3 months – 2 years (highly variable by country)",
    "Depends on visa category granted",
    [`Your family member in ${destination} must have legal status and meet minimum income requirements`,"Proof of genuine relationship is essential — authorities look for shared finances, communication history, photos","Processing times for family visas can be very long — especially for US/Canada/UK","Some family visas lead to permanent residency after a qualifying period","In many countries, dependent visa holders can work — confirm the rules for "+ destination]
  ));

  return visas;
};

// ── VISA TYPES PANEL COMPONENT ────────────────────────────────────────────────
const VisaTypesPanel = ({ passport, destination }) => {
  const [expanded, setExpanded] = useState(null);
  const visaTypes = getDestinationVisaTypes(passport, destination);

  if (!visaTypes.length) return (
    <div style={{ textAlign:"center", padding:"30px 0", color:"#8b949e", fontSize:14 }}>
      No specific visa types available for this combination.
    </div>
  );

  return (
    <div>
      <div style={{ fontSize:13, color:"#8b949e", lineHeight:1.6, marginBottom:18 }}>
        Visa categories available to <strong style={{color:"#e6edf3"}}>{passport}</strong> passport holders specifically for <strong style={{color:"#e6edf3"}}>{destination}</strong>. Click any category to expand full details.
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {visaTypes.map(vt => (
          <div key={vt.id} style={{ background:"#0d1117", borderRadius:12, border:`1px solid ${expanded===vt.id ? vt.color+"66" : "#30363d"}`, overflow:"hidden", transition:"border-color 0.2s" }}>
            {/* Header */}
            <div onClick={() => setExpanded(expanded===vt.id ? null : vt.id)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:20 }}>{vt.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#e6edf3" }}>{vt.name}</div>
                  <div style={{ fontSize:12, color:"#8b949e", marginTop:2, lineHeight:1.4 }}>{vt.desc}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:12 }}>
                {vt.workAllowed && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:100, background:"#34d39922", border:"1px solid #34d39944", color:"#34d399" }}>Work ✓</span>}
                <span style={{ color: expanded===vt.id ? vt.color : "#8b949e", fontSize:14 }}>{expanded===vt.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded */}
            {expanded === vt.id && (
              <div style={{ padding:"0 16px 18px", borderTop:"1px solid #ffffff0d" }}>
                {/* Quick stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, margin:"14px 0" }}>
                  {[["⏱ Duration", vt.duration],["💰 Fee", vt.fee],["📅 Processing", vt.processingTime]].map(([l,val]) => (
                    <div key={l} style={{ background:"#161b22", borderRadius:10, padding:"10px 12px", border:`1px solid ${vt.color}22` }}>
                      <div style={{ fontSize:10, color:"#8b949e", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>{l}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#e6edf3" }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* How to apply */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>📝 How to Apply</div>
                  {vt.howToApply.split("\n").filter(Boolean).map((step, i) => {
                    const clean = step.replace(/^\d+\.\s*/, "");
                    const isNumbered = /^\d+\./.test(step);
                    return isNumbered ? (
                      <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:"#1a6fa533", border:"1px solid #1a6fa555", color:"#4fc3f7", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                        <div style={{ fontSize:13, color:"#c9d1d9", lineHeight:1.5, paddingTop:1 }}>{clean}</div>
                      </div>
                    ) : (
                      <div key={i} style={{ fontSize:13, color:"#c9d1d9", lineHeight:1.6, marginBottom:6 }}>{step}</div>
                    );
                  })}
                </div>

                {/* Documents */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>🗂 Documents Required</div>
                  {vt.docs.map((doc, i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:7, fontSize:13, color:"#c9d1d9" }}>
                      <span style={{ color:"#00c896", flexShrink:0 }}>✓</span><span>{doc}</span>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>💡 Key Tips</div>
                  {vt.tips.map((tip, i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:7, fontSize:13, color:"#8b949e" }}>
                      <span style={{ color:vt.color, flexShrink:0 }}>›</span><span>{tip}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:14, padding:"10px 14px", background:"#161b22", borderRadius:10, border:"1px solid #30363d" }}>
                  <div style={{ fontSize:11, color:"#484f58" }}>⚠️ Always verify current requirements at the official embassy or government website of {destination} before applying.</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── COMPONENTS ────────────────────────────────────────────────────────────────
const BadgePill = ({ label, color }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:100, background:color+"22", border:`1px solid ${color}55`, color, fontSize:13, fontWeight:700, letterSpacing:"0.02em" }}>
    <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block" }} />{label}
  </span>
);

const StrengthMeter = ({ score, color }) => (
  <div style={{ margin:"8px 0" }}>
    <div style={{ height:6, borderRadius:3, background:"#ffffff15", overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${score}%`, borderRadius:3, background:`linear-gradient(90deg,${color}88,${color})`, transition:"width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  </div>
);

const ComboInput = ({ label, placeholder, value, search, onChange, onSelect, options, show, onFocus, onBlur }) => (
  <div>
    <label style={{ fontSize:11, fontWeight:700, color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, display:"block" }}>{label}</label>
    <div style={{ position:"relative" }}>
      <input className="input-focus" style={{ width:"100%", padding:"13px 16px", borderRadius:10, background:"#0d1117", border:"1px solid #30363d", color:"#e6edf3", fontSize:15, outline:"none", boxSizing:"border-box" }}
        placeholder={placeholder} value={value || search} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
      {show && search && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#1c2128", border:"1px solid #30363d", borderRadius:10, maxHeight:200, overflowY:"auto", zIndex:100, boxShadow:"0 8px 32px #00000066" }}>
          {options.slice(0,30).map(c => (
            <div key={c} className="drop-item" style={{ padding:"10px 16px", cursor:"pointer", fontSize:14, borderBottom:"1px solid #30363d22" }} onMouseDown={() => onSelect(c)}>{c}</div>
          ))}
          {options.length === 0 && <div style={{ padding:"10px 16px", fontSize:13, color:"#8b949e" }}>No results</div>}
        </div>
      )}
    </div>
  </div>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [passport, setPassport] = useState("");
  const [destination, setDestination] = useState("");
  const [transit, setTransit] = useState("");
  const [passportSearch, setPassportSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [transitSearch, setTransitSearch] = useState("");
  const [showPDrop, setShowPDrop] = useState(false);
  const [showDDrop, setShowDDrop] = useState(false);
  const [showTDrop, setShowTDrop] = useState(false);
  const [activeTab, setActiveTab] = useState("requirement");
  const [searched, setSearched] = useState(false);
  const [mode, setMode] = useState("direct");

  const filtP = useMemo(() => PASSPORT_COUNTRIES.filter(c => c.toLowerCase().includes(passportSearch.toLowerCase())), [passportSearch]);
  const filtD = useMemo(() => PASSPORT_COUNTRIES.filter(c => c.toLowerCase().includes(destSearch.toLowerCase())), [destSearch]);
  const filtT = useMemo(() => PASSPORT_COUNTRIES.filter(c => c.toLowerCase().includes(transitSearch.toLowerCase()) && c !== destination), [transitSearch, destination]);

  const visaInfo = useMemo(() => passport && destination ? getVisaInfo(passport, destination) : null, [passport, destination]);
  const transitInfo = useMemo(() => passport && transit ? getTransitInfo(passport, transit) : null, [passport, transit]);
  const strength = useMemo(() => passport ? getPassportStrength(passport) : null, [passport]);

  const canSearch = passport && destination && (mode === "direct" || transit);

  const handleSearch = () => { if (canSearch) { setSearched(true); setActiveTab("requirement"); } };
  const reset = () => { setPassport(""); setDestination(""); setTransit(""); setPassportSearch(""); setDestSearch(""); setTransitSearch(""); setSearched(false); setMode("direct"); };

  const tabs = [
    { id:"requirement", label:"📋 Visa Info" },
    { id:"process", label:"📝 How to Apply" },
    { id:"documents", label:"🗂 Documents" },
    ...(mode === "transit" && transit ? [{ id:"transit", label:"🔄 Transit Visa" }] : []),
    { id:"visatypes", label:"🗺️ Visa Types" },
  ];

  const pSteps = (visaInfo?.process || "").split("\n").filter(Boolean);
  const tSteps = (transitInfo?.process || "").split("\n").filter(Boolean);

  const s = {
    card: { background:"#161b22", border:"1px solid #30363d", borderRadius:16, padding:"24px 28px" },
    sTitle: { fontSize:11, fontWeight:700, color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 },
    docRow: { display:"flex", gap:10, marginBottom:10, fontSize:14, color:"#c9d1d9", lineHeight:1.6 },
    tipRow: { display:"flex", gap:10, marginBottom:8, fontSize:13, color:"#8b949e" },
    stepRow: { display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" },
    stepNum: { width:22, height:22, borderRadius:"50%", background:"#1a6fa533", border:"1px solid #1a6fa555", color:"#4fc3f7", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    infoBox: (color) => ({ marginTop:16, padding:"14px 16px", background:"#0d1117", borderRadius:10, border:`1px solid ${color}33` }),
    infoBoxLabel: (color) => ({ fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }),
    statBox: { background:"#0d1117", borderRadius:10, padding:"14px 16px" },
    statLabel: { fontSize:11, color:"#8b949e", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 },
    statVal: { fontSize:15, fontWeight:700, color:"#e6edf3" },
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0d1117", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#e6edf3", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0d1117}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
        .drop-item:hover{background:#21262d!important;color:#4fc3f7!important}
        .sbtn:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}
        .sbtn:disabled{opacity:.38;cursor:not-allowed}
        .tab-on{background:#1c2128!important;color:#4fc3f7!important;border:1px solid #30363d!important}
        .tab-off{background:transparent!important;color:#8b949e!important;border:1px solid transparent!important}
        .input-focus:focus{border-color:#4fc3f7!important;outline:none}
        .mbtn{padding:9px 20px;border-radius:8px;border:1px solid #30363d;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
        .mbtn-on{background:#1a3a5c;border-color:#4fc3f777;color:#4fc3f7}
        .mbtn-off{background:transparent;color:#8b949e}
        @media(max-width:640px){.grid3{grid-template-columns:1fr!important}}
      `}</style>

      {/* Hero */}
      <div style={{ width:"100%", padding:"56px 20px 36px", textAlign:"center", background:"radial-gradient(ellipse 80% 60% at 50% 0%,#1a3a5c44,transparent)", borderBottom:"1px solid #ffffff10" }}>
        <div style={{ display:"inline-block", padding:"5px 16px", borderRadius:100, background:"#1a3a5c", border:"1px solid #2d6fa555", color:"#4fc3f7", fontSize:12, fontWeight:600, letterSpacing:"0.08em", marginBottom:20, textTransform:"uppercase" }}>🛂 Passport Intelligence</div>
        <h1 style={{ fontSize:"clamp(30px,5vw,56px)", fontWeight:800, background:"linear-gradient(135deg,#e6edf3 30%,#4fc3f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.1, margin:"0 0 14px" }}>Where Can Your<br />Passport Take You?</h1>
        <p style={{ color:"#8b949e", fontSize:"clamp(14px,2vw,17px)", maxWidth:580, margin:"0 auto" }}>Check visa requirements, transit rules, application steps, and travel access for any passport — worldwide.</p>
      </div>

      {/* Search */}
      <div style={{ width:"100%", maxWidth:880, padding:"0 20px", marginTop:-20, position:"relative", zIndex:10 }}>
        <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:20, padding:"26px 28px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* Mode toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#8b949e", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>Trip type:</span>
            <button className={`mbtn ${mode==="direct"?"mbtn-on":"mbtn-off"}`} onClick={() => { setMode("direct"); setTransit(""); setTransitSearch(""); setSearched(false); }}>✈️ Direct Travel</button>
            <button className={`mbtn ${mode==="transit"?"mbtn-on":"mbtn-off"}`} onClick={() => { setMode("transit"); setSearched(false); }}>🔄 With Transit Stop</button>
          </div>

          {/* Passport + Destination */}
          <div className="grid3" style={{ display:"grid", gridTemplateColumns:"1fr 36px 1fr", gap:12, alignItems:"start" }}>
            <ComboInput label="🛂 Your Passport" placeholder="Search your country..." value={passport} search={passportSearch}
              onChange={e => { setPassportSearch(e.target.value); setPassport(""); setShowPDrop(true); setSearched(false); }}
              onSelect={c => { setPassport(c); setPassportSearch(c); setShowPDrop(false); setSearched(false); }}
              options={filtP} show={showPDrop} onFocus={() => setShowPDrop(true)} onBlur={() => setTimeout(() => setShowPDrop(false), 150)} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", paddingTop:28, color:"#4fc3f7", fontSize:18 }}>→</div>
            <ComboInput label="🌍 Destination" placeholder="Where are you going?" value={destination} search={destSearch}
              onChange={e => { setDestSearch(e.target.value); setDestination(""); setShowDDrop(true); setSearched(false); }}
              onSelect={c => { setDestination(c); setDestSearch(c); setShowDDrop(false); setSearched(false); }}
              options={filtD} show={showDDrop} onFocus={() => setShowDDrop(true)} onBlur={() => setTimeout(() => setShowDDrop(false), 150)} />
          </div>

          {/* Transit */}
          {mode === "transit" && (
            <div style={{ padding:"16px 20px", background:"#0d1117", borderRadius:12, border:"1px dashed #30363d" }}>
              <div style={{ fontSize:12, color:"#4fc3f7", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>🔄 Transit / Layover Country</div>
              <ComboInput label="Which country are you transiting through?" placeholder="e.g. United Kingdom, UAE, United States..."
                value={transit} search={transitSearch}
                onChange={e => { setTransitSearch(e.target.value); setTransit(""); setShowTDrop(true); setSearched(false); }}
                onSelect={c => { setTransit(c); setTransitSearch(c); setShowTDrop(false); setSearched(false); }}
                options={filtT} show={showTDrop} onFocus={() => setShowTDrop(true)} onBlur={() => setTimeout(() => setShowTDrop(false), 150)} />
              <div style={{ fontSize:12, color:"#8b949e", marginTop:10 }}>ℹ️ Transit visa rules apply even if you stay in the airport. Countries like the US, UK, and Schengen zone have strict airside transit requirements.</div>
            </div>
          )}

          <div style={{ display:"flex", gap:12 }}>
            <button className="sbtn" disabled={!canSearch}
              style={{ flex:1, padding:"14px 36px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#1a6fa5,#4fc3f7)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"0.02em", transition:"opacity .2s,transform .15s", fontFamily:"inherit" }}
              onClick={handleSearch}>Check Visa Requirements →</button>
            {searched && <button onClick={reset} style={{ padding:"14px 18px", borderRadius:10, border:"1px solid #30363d", background:"transparent", color:"#8b949e", fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Reset</button>}
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && visaInfo && (
        <div style={{ width:"100%", maxWidth:880, padding:"0 20px", marginTop:24 }}>

          {/* Header banner */}
          <div style={{ ...s.card, marginBottom:12, background:`linear-gradient(135deg,#161b22,${visaInfo.color}11)`, border:`1px solid ${visaInfo.color}33`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:13, color:"#8b949e", marginBottom:5 }}>{passport} {mode==="transit"&&transit?`→ ${transit} → `:"→ "}{destination}</div>
              <div style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:800, display:"flex", alignItems:"center", gap:10 }}>
                <span>{visaInfo.icon}</span><span style={{ color:visaInfo.color }}>{visaInfo.label}</span>
              </div>
              <div style={{ fontSize:13, color:"#8b949e", marginTop:4 }}>Permitted stay: <span style={{ color:"#e6edf3", fontWeight:600 }}>{visaInfo.stay}</span></div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
              <BadgePill label={visaInfo.label} color={visaInfo.color} />
              {mode==="transit"&&transitInfo&&<BadgePill label={`Transit: ${transitInfo.label}`} color={transitInfo.color} />}
            </div>
          </div>

          {/* Transit alert */}
          {mode === "transit" && transitInfo && (
            <div style={{ background:transitInfo.required?"#e05c5c0d":"#00c8960d", border:`1px solid ${transitInfo.color}44`, borderRadius:12, padding:"14px 18px", marginBottom:12, display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{transitInfo.icon}</span>
              <div>
                <div style={{ fontWeight:700, color:transitInfo.color, fontSize:14, marginBottom:3 }}>Transit through {transit}: {transitInfo.label}</div>
                <div style={{ fontSize:13, color:"#8b949e", lineHeight:1.6 }}>{transitInfo.description}</div>
                {transitInfo.airside && <div style={{ marginTop:6, fontSize:12, color:"#f5a623", fontWeight:600 }}>⚠️ Airside rule — applies even if you never leave the terminal.</div>}
              </div>
            </div>
          )}

          {/* Strength */}
          {strength && (
            <div style={{ ...s.card, marginBottom:12 }}>
              <div style={s.sTitle}>Your Passport Strength</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:strength.color }}>{strength.rank}</div>
                  <div style={{ fontSize:13, color:"#8b949e", marginTop:2 }}>Visa-free access to ~{strength.visaFree} countries</div>
                </div>
                <div style={{ fontSize:28, fontWeight:800, color:strength.color }}>{strength.score}<span style={{ fontSize:14, color:"#8b949e" }}>/100</span></div>
              </div>
              <StrengthMeter score={strength.score} color={strength.color} />
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, padding:4, background:"#0d1117", borderRadius:10, marginBottom:12, flexWrap:"wrap" }}>
            {tabs.map(t => (
              <button key={t.id} className={activeTab===t.id?"tab-on":"tab-off"}
                style={{ flex:"1 1 auto", padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, transition:"all .2s", fontFamily:"inherit", minWidth:100 }}
                onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ ...s.card, marginBottom:48 }}>

            {activeTab === "requirement" && <>
              <div style={{ ...s.sTitle }}>Overview</div>
              <p style={{ fontSize:15, color:"#c9d1d9", lineHeight:1.7, margin:"0 0 20px" }}>{visaInfo.description}</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[["Visa Type",visaInfo.label],["Max Stay",visaInfo.stay],["Processing Time",visaInfo.processingTime],["Approximate Fee",visaInfo.fee]].map(([l,v]) => (
                  <div key={l} style={s.statBox}><div style={s.statLabel}>{l}</div><div style={s.statVal}>{v}</div></div>
                ))}
              </div>
              <div style={s.sTitle}>💡 Pro Tips</div>
              {visaInfo.tips?.map((tip,i) => <div key={i} style={s.tipRow}><span style={{ color:"#4fc3f7", flexShrink:0 }}>›</span><span>{tip}</span></div>)}
            </>}

            {activeTab === "process" && <>
              <div style={s.sTitle}>Application Process — {destination}</div>
              {pSteps.map((step,i) => <div key={i} style={s.stepRow}><div style={s.stepNum}>{i+1}</div><div style={{ fontSize:14, color:"#c9d1d9", lineHeight:1.6, paddingTop:2 }}>{step.replace(/^\d+\.\s*/,"")}</div></div>)}
              <div style={s.infoBox("#8b949e")}><div style={s.infoBoxLabel("#8b949e")}>⚠️ Important Note</div><div style={{ fontSize:13, color:"#8b949e", lineHeight:1.6 }}>Always verify requirements on the official embassy or government website of {destination} before applying. Policies can change without notice.</div></div>
            </>}

            {activeTab === "documents" && <>
              <div style={s.sTitle}>Required Documents — {destination}</div>
              {visaInfo.documents?.map((doc,i) => <div key={i} style={s.docRow}><span style={{ color:"#00c896", flexShrink:0, marginTop:1 }}>✓</span><span>{doc}</span></div>)}
              <div style={s.infoBox("#4fc3f7")}><div style={s.infoBoxLabel("#4fc3f7")}>📌 Reminder</div><div style={{ fontSize:13, color:"#8b949e", lineHeight:1.6 }}>Requirements may vary by travel purpose (tourism, business, study, family visit). Always confirm with the official consulate or embassy of {destination}.</div></div>
            </>}

            {activeTab === "transit" && transitInfo && <>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                <span style={{ fontSize:24 }}>{transitInfo.icon}</span>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:transitInfo.color }}>{transitInfo.label}</div>
                  <div style={{ fontSize:12, color:"#8b949e", marginTop:2 }}>Transit through {transit}</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[
                  ["Transit Type", transitInfo.type.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())],
                  ["Max Transit Time", transitInfo.maxTransit||"N/A"],
                  ["Processing Time", transitInfo.processingTime],
                  ["Transit Fee", transitInfo.fee],
                ].map(([l,v]) => <div key={l} style={s.statBox}><div style={s.statLabel}>{l}</div><div style={s.statVal}>{v}</div></div>)}
              </div>

              {transitInfo.required && <>
                <div style={s.sTitle}>Required Documents</div>
                {transitInfo.documents?.map((doc,i) => <div key={i} style={s.docRow}><span style={{ color:"#00c896", flexShrink:0 }}>✓</span><span>{doc}</span></div>)}
                <div style={{ ...s.sTitle, marginTop:18 }}>Application Steps</div>
                {tSteps.map((step,i) => <div key={i} style={s.stepRow}><div style={s.stepNum}>{i+1}</div><div style={{ fontSize:14, color:"#c9d1d9", lineHeight:1.6, paddingTop:2 }}>{step.replace(/^\d+\.\s*/,"")}</div></div>)}
              </>}

              <div style={{ ...s.sTitle, marginTop:18 }}>💡 Transit Tips</div>
              {transitInfo.tips?.map((tip,i) => <div key={i} style={s.tipRow}><span style={{ color:"#4fc3f7", flexShrink:0 }}>›</span><span>{tip}</span></div>)}

              <div style={s.infoBox("#f5a623")}><div style={s.infoBoxLabel("#f5a623")}>⚠️ Always Verify</div><div style={{ fontSize:13, color:"#8b949e", lineHeight:1.6 }}>Transit visa rules change frequently. Always confirm with the immigration authority of {transit} or your airline before booking. Airlines may deny boarding if transit documents are missing.</div></div>
            </>}

            {activeTab === "visatypes" && (
              <VisaTypesPanel passport={passport} destination={destination} />
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searched && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#8b949e" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🗺️</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#c9d1d9", marginBottom:8 }}>Select your passport and destination</div>
          <div style={{ fontSize:14, maxWidth:400, margin:"0 auto", lineHeight:1.7 }}>
            Choose <strong style={{ color:"#4fc3f7" }}>Direct Travel</strong> for destination visa info, or <strong style={{ color:"#4fc3f7" }}>With Transit Stop</strong> to also check if a transit visa is required at your layover country.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop:"auto", padding:"28px 20px 20px", textAlign:"center", color:"#484f58", fontSize:12, borderTop:"1px solid #21262d", width:"100%" }}>
        <div style={{ marginBottom:4 }}>Passport Visa Checker — for informational purposes only</div>
        <div>Always verify at the official embassy, consulate, or immigration authority of your destination and transit countries.</div>
      </div>
    </div>
  );
}
